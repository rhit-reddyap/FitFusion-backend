-- Create team_invites table
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_invitee_email ON team_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);

-- Enable RLS
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_invites
-- Users can view invites sent to their email
CREATE POLICY "Users can view their invites" ON team_invites
  FOR SELECT USING (
    invitee_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Team admins can view invites for their teams
CREATE POLICY "Team admins can view team invites" ON team_invites
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM teams WHERE admin_id = auth.uid()
    )
  );

-- Team admins can create invites for their teams
CREATE POLICY "Team admins can create invites" ON team_invites
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE admin_id = auth.uid()
    )
  );

-- Users can update invites sent to their email (accept/decline)
CREATE POLICY "Users can update their invites" ON team_invites
  FOR UPDATE USING (
    invitee_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Team admins can update invites for their teams
CREATE POLICY "Team admins can update team invites" ON team_invites
  FOR UPDATE USING (
    team_id IN (
      SELECT id FROM teams WHERE admin_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_invites_updated_at 
  BEFORE UPDATE ON team_invites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON team_invites TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;




