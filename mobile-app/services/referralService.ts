import { supabase } from '../lib/supabase';

export interface ReferralData {
  referralCode: string;
  referralCount: number;
  totalRewards: number;
}

export interface ReferralReward {
  id: string;
  rewardType: string;
  rewardValue: number;
  status: string;
  expiresAt: string;
  createdAt: string;
}

class ReferralService {
  // Get or create user's referral code
  async getUserReferralCode(userId: string): Promise<string> {
    try {
      // First try to get existing code from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();

      if (!profileError && profile?.referral_code) {
        return profile.referral_code;
      }

      // If no code exists, try to create one using the database function
      try {
        const { data, error } = await supabase.rpc('get_or_create_referral_code', {
          user_id: userId
        });

        if (!error && data) {
          return data;
        }
      } catch (rpcError) {
        console.log('Database function not available, generating locally...');
      }

      // Fallback: Generate code locally and save to database
      const generatedCode = this.generateReferralCode();
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referral_code: generatedCode })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating referral code:', updateError);
        // Return the generated code anyway
        return generatedCode;
      }

      return generatedCode;
    } catch (error) {
      console.error('Error in getUserReferralCode:', error);
      // Fallback: Generate a code locally
      return this.generateReferralCode();
    }
  }

  // Generate a unique referral code locally
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Get user's referral stats
  async getUserReferralStats(userId: string): Promise<ReferralData> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code, referral_count, total_referral_rewards')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error getting referral stats:', error);
        // Return default stats if database columns don't exist yet
        return {
          referralCode: '',
          referralCount: 0,
          totalRewards: 0
        };
      }

      return {
        referralCode: data?.referral_code || '',
        referralCount: data?.referral_count || 0,
        totalRewards: data?.total_referral_rewards || 0
      };
    } catch (error) {
      console.error('Error in getUserReferralStats:', error);
      // Return default stats on error
      return {
        referralCode: '',
        referralCount: 0,
        totalRewards: 0
      };
    }
  }

  // Apply referral code during signup
  async applyReferralCode(userId: string, referralCode: string): Promise<boolean> {
    try {
      // First try the database function
      try {
        const { data, error } = await supabase.rpc('apply_referral_reward', {
          referred_user_id: userId,
          referral_code: referralCode
        });

        if (!error && data) {
          return data;
        }
      } catch (rpcError) {
        console.log('Database function not available, using fallback...');
      }

      // Fallback: Manual referral application
      // Find the referrer by code
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id, referral_count, total_referral_rewards')
        .eq('referral_code', referralCode)
        .single();

      if (referrerError || !referrer) {
        console.error('Referrer not found for code:', referralCode);
        return false;
      }

      // Check if user was already referred
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', userId)
        .single();

      if (existingReferral) {
        console.log('User already referred');
        return false;
      }

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_user_id: userId,
          referral_code: referralCode
        });

      if (referralError) {
        console.error('Error creating referral record:', referralError);
        return false;
      }

      // Update referrer stats
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          referral_count: (referrer.referral_count || 0) + 1,
          total_referral_rewards: (referrer.total_referral_rewards || 0) + 1
        })
        .eq('id', referrer.id);

      if (updateError) {
        console.error('Error updating referrer stats:', updateError);
        // Still return true since referral was created
      }

      return true;
    } catch (error) {
      console.error('Error in applyReferralCode:', error);
      return false;
    }
  }

  // Get user's referral rewards
  async getUserReferralRewards(userId: string): Promise<ReferralReward[]> {
    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting referral rewards:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserReferralRewards:', error);
      throw error;
    }
  }

  // Get user's referral history
  async getUserReferralHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:profiles!referrals_referred_user_id_fkey(
            id,
            display_name,
            email,
            created_at
          )
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting referral history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserReferralHistory:', error);
      throw error;
    }
  }

  // Validate referral code exists
  async validateReferralCode(referralCode: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error validating referral code:', error);
      return false;
    }
  }

  // Share referral code (for sharing functionality)
  getReferralShareText(referralCode: string): string {
    return `Join me on Fit Fusion AI! Use my referral code: ${referralCode} and get started with your fitness journey! 🏋️‍♀️💪`;
  }

  // Get referral URL (if you want to implement web-based referrals)
  getReferralUrl(referralCode: string): string {
    return `https://fit-fusion-ai-five.vercel.app/signup?ref=${referralCode}`;
  }
}

export default new ReferralService();

