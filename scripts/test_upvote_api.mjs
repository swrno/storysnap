
const BASE_URL = 'http://localhost:3000';
const USER_ID = 'test-user-123'; // Mock user ID

async function testUpvote() {
  try {
    // 1. Get a story ID
    console.log('Fetching stories...');
    const storiesResponse = await fetch(`${BASE_URL}/api/stories`);
    const storiesData = await storiesResponse.json();
    
    if (!storiesData.stories || storiesData.stories.length === 0) {
      console.log('No stories found to test upvote.');
      return;
    }
    
    const storyId = storiesData.stories[0]._id;
    console.log(`Testing upvote for story: ${storyId}`);
    
    // 2. Upvote
    console.log('Sending UPVOTE request...');
    const upvoteResponse = await fetch(`${BASE_URL}/api/stories/${storyId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID }),
    });
    
    const upvoteData = await upvoteResponse.json();
    console.log('Upvote Response:', upvoteData);
    
    if (upvoteData.hasUpvoted === true) {
      console.log('SUCCESS: Upvote registered.');
    } else {
      console.error('FAILURE: Upvote did not register.');
    }
    
    // 3. Downvote (Toggle)
    console.log('Sending DOWNVOTE (Toggle) request...');
    const downvoteResponse = await fetch(`${BASE_URL}/api/stories/${storyId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID }),
    });
    
    const downvoteData = await downvoteResponse.json();
    console.log('Downvote Response:', downvoteData);
    
    if (downvoteData.hasUpvoted === false) {
      console.log('SUCCESS: Downvote registered.');
    } else {
      console.error('FAILURE: Downvote did not register.');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUpvote();
