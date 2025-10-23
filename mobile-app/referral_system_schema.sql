-- Referral System Database Schema
-- Run this in your Supabase SQL editor

-- 1. Add referral_code column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referral_rewards INTEGER DEFAULT 0;

-- 2. Create referrals table to track referral relationships
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referral_code VARCHAR(8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reward_claimed BOOLEAN DEFAULT FALSE,
    reward_claimed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(referred_user_id) -- Each user can only be referred once
);

-- 3. Create referral_rewards table to track free months given
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
    reward_type VARCHAR(20) DEFAULT 'free_month',
    reward_value INTEGER DEFAULT 30, -- 30 days free
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' -- pending, applied, expired
);

-- 4. Create RLS policies for referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can read their own referrals (as referrer or referred)
CREATE POLICY "Users can read own referrals" ON referrals
    FOR SELECT USING (
        referrer_id = auth.uid() OR referred_user_id = auth.uid()
    );

-- Users can insert referrals when they refer someone
CREATE POLICY "Users can create referrals" ON referrals
    FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- 5. Create RLS policies for referral_rewards table
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Users can read their own rewards
CREATE POLICY "Users can read own rewards" ON referral_rewards
    FOR SELECT USING (referrer_id = auth.uid());

-- 6. Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    code VARCHAR(8);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate a random 8-character code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_count 
        FROM profiles 
        WHERE referral_code = code;
        
        -- If code doesn't exist, return it
        IF exists_count = 0 THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to apply referral reward
CREATE OR REPLACE FUNCTION apply_referral_reward(referred_user_id UUID, referral_code VARCHAR(8))
RETURNS BOOLEAN AS $$
DECLARE
    referrer_id UUID;
    referral_record UUID;
BEGIN
    -- Find the referrer by referral code
    SELECT id INTO referrer_id 
    FROM profiles 
    WHERE referral_code = apply_referral_reward.referral_code;
    
    -- If referrer not found, return false
    IF referrer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user was already referred
    IF EXISTS (SELECT 1 FROM referrals WHERE referred_user_id = apply_referral_reward.referred_user_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Create referral record
    INSERT INTO referrals (referrer_id, referred_user_id, referral_code)
    VALUES (referrer_id, apply_referral_reward.referred_user_id, apply_referral_reward.referral_code)
    RETURNING id INTO referral_record;
    
    -- Create reward for referrer (30 days free)
    INSERT INTO referral_rewards (referrer_id, referral_id, expires_at)
    VALUES (referrer_id, referral_record, NOW() + INTERVAL '30 days');
    
    -- Update referrer's stats
    UPDATE profiles 
    SET referral_count = referral_count + 1,
        total_referral_rewards = total_referral_rewards + 1
    WHERE id = referrer_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to get user's referral code (generate if doesn't exist)
CREATE OR REPLACE FUNCTION get_or_create_referral_code(user_id UUID)
RETURNS VARCHAR(8) AS $$
DECLARE
    existing_code VARCHAR(8);
    new_code VARCHAR(8);
BEGIN
    -- Check if user already has a referral code
    SELECT referral_code INTO existing_code 
    FROM profiles 
    WHERE id = user_id;
    
    -- If code exists, return it
    IF existing_code IS NOT NULL THEN
        RETURN existing_code;
    END IF;
    
    -- Generate new code
    new_code := generate_referral_code();
    
    -- Update user's profile with new code
    UPDATE profiles 
    SET referral_code = new_code 
    WHERE id = user_id;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer_id ON referral_rewards(referrer_id);

