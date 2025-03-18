const adjectives = [
  'Swift', 'Brave', 'Mystic', 'Silent', 'Cosmic', 'Wild', 'Noble', 'Hidden', 'Bright', 'Shadow',
  'Crystal', 'Ancient', 'Eternal', 'Radiant', 'Stellar', 'Lunar', 'Solar', 'Astral', 'Phantom', 'Echo',
  'Crimson', 'Azure', 'Golden', 'Silver', 'Emerald', 'Sapphire', 'Ruby', 'Amber', 'Jade', 'Onyx',
  'Neon', 'Cyber', 'Quantum', 'Nebula', 'Void', 'Storm', 'Frost', 'Blaze', 'Thunder', 'Flux'
];

const nouns = [
  'Wolf', 'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Lion', 'Falcon', 'Raven', 'Hawk', 'Owl',
  'Knight', 'Warrior', 'Hunter', 'Scout', 'Ranger', 'Guardian', 'Sentinel', 'Watcher', 'Runner', 'Seeker',
  'Spirit', 'Ghost', 'Shadow', 'Storm', 'Star', 'Moon', 'Sun', 'Wind', 'Wave', 'Fire',
  'Ninja', 'Samurai', 'Ronin', 'Sage', 'Mage', 'Titan', 'Atlas', 'Nova', 'Pulse', 'Echo'
];

export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjective}${noun}${number.toString().padStart(3, '0')}`;
}

// Function to check if username exists in the database
export async function isUsernameTaken(username: string, supabase: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .limit(1);

    if (error) {
      console.error('Error checking username:', error);
      return true; // Assume taken on error to be safe
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in isUsernameTaken:', error);
    return true; // Assume taken on error to be safe
  }
}

// Generate a unique username
export async function generateUniqueUsername(supabase: any): Promise<string> {
  let username = generateRandomUsername();
  let attempts = 0;
  const maxAttempts = 15; // Increased max attempts

  while (await isUsernameTaken(username, supabase) && attempts < maxAttempts) {
    username = generateRandomUsername();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // If we can't find a unique username after max attempts,
    // add more entropy with timestamp and random string
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 5);
    username = `${generateRandomUsername()}_${timestamp}${randomStr}`;
    
    // Verify one last time
    if (await isUsernameTaken(username, supabase)) {
      throw new Error('Could not generate unique username after multiple attempts');
    }
  }

  return username;
}
