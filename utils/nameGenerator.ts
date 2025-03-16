const adjectives = [
  'Swift', 'Brave', 'Mystic', 'Silent', 'Cosmic', 'Wild', 'Noble', 'Hidden', 'Bright', 'Shadow',
  'Crystal', 'Ancient', 'Eternal', 'Radiant', 'Stellar', 'Lunar', 'Solar', 'Astral', 'Phantom', 'Echo',
  'Crimson', 'Azure', 'Golden', 'Silver', 'Emerald', 'Sapphire', 'Ruby', 'Amber', 'Jade', 'Onyx'
];

const nouns = [
  'Wolf', 'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Lion', 'Falcon', 'Raven', 'Hawk', 'Owl',
  'Knight', 'Warrior', 'Hunter', 'Scout', 'Ranger', 'Guardian', 'Sentinel', 'Watcher', 'Runner', 'Seeker',
  'Spirit', 'Ghost', 'Shadow', 'Storm', 'Star', 'Moon', 'Sun', 'Wind', 'Wave', 'Fire'
];

export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjective}${noun}${number}`;
}

// Function to check if username exists in the database
export async function isUsernameTaken(username: string, supabase: any): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error checking username:', error);
    return false;
  }

  return !!data;
}

// Generate a unique username
export async function generateUniqueUsername(supabase: any): Promise<string> {
  let username = generateRandomUsername();
  let attempts = 0;
  const maxAttempts = 10;

  while (await isUsernameTaken(username, supabase) && attempts < maxAttempts) {
    username = generateRandomUsername();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // If we can't find a unique username after max attempts, add a timestamp
    username = `${generateRandomUsername()}_${Date.now()}`;
  }

  return username;
}
