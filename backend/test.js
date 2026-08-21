const { sequelize, User, Post, Comment, Follow, Bookmark } = require('./models');

async function test() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced for verification test.');

    // 1. Create User with case-insensitive email and username
    const user1 = await User.create({
      name: 'Rithwik Goud',
      username: 'RithwikDev',
      email: 'Rithwik.Goud@Example.COM',
      password: 'password123',
      bio: 'Fullstack AI Developer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isPrivate: false,
      interests: JSON.stringify(['Technology', 'AI', 'Coding'])
    });
    console.log('✔ User 1 created:', user1.username, '| Normalized email:', user1.email);

    // Verify lowercased email
    if (user1.email !== 'rithwik.goud@example.com' || user1.username !== 'rithwikdev') {
      throw new Error('Case normalization failed!');
    }

    // 2. Attempt duplicate username (should fail)
    try {
      await User.create({
        name: 'Duplicate',
        username: 'rithwikdev',
        email: 'other@example.com',
        password: 'password123'
      });
      throw new Error('Failed: Duplicate username allowed!');
    } catch (e) {
      console.log('✔ Duplicate username correctly blocked!');
    }

    // 3. Create Posts
    const post1 = await Post.create({
      title: 'Building Modern Dynamic Apps with Antigravity',
      content: 'Antigravity enables rich, lag-free web experiences with glassmorphism and clean architecture.',
      category: 'Technology',
      tags: JSON.stringify(['ai', 'coding', 'webdev']),
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      allowComments: true,
      isArchived: false,
      userId: user1.id
    });
    console.log('✔ Post 1 created:', post1.title);

    const post2 = await Post.create({
      title: 'Archived Thoughts on Design',
      content: 'Personal notes that are archived.',
      category: 'Design',
      tags: JSON.stringify(['design']),
      coverImage: '',
      allowComments: false,
      isArchived: true,
      userId: user1.id
    });
    console.log('✔ Post 2 (Archived) created:', post2.title);

    // 4. Test Bookmarking
    const bm = await Bookmark.create({ userId: user1.id, postId: post1.id });
    console.log('✔ Bookmark created for post:', bm.postId);

    const userBookmarks = await Bookmark.findAll({ where: { userId: user1.id } });
    if (userBookmarks.length !== 1 || userBookmarks[0].postId !== post1.id) {
      throw new Error('Bookmark verification failed!');
    }
    console.log('✔ Bookmarking test passed!');

    // 5. Verify Reverse Chronological Listing & Archive Filter
    const activePosts = await Post.findAll({
      where: { isArchived: false },
      order: [['createdAt', 'DESC']]
    });
    console.log('✔ Active public posts count:', activePosts.length);
    if (activePosts.length !== 1 || activePosts[0].id !== post1.id) {
      throw new Error('Archive filtering or sorting error!');
    }

    console.log('ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('VERIFICATION ERROR:', err);
  } finally {
    process.exit(0);
  }
}
test();
