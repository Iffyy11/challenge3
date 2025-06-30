// Main function that runs when the DOM is loaded
function main() {
    displayPosts();
    addNewPostListener();
    setupEditForm();

    setTimeout(() => {
        const firstPost = document.querySelector('.post-item');
        if (firstPost) {
            firstPost.click();
        }
    }, 300);
}

// Display all posts
function displayPosts() {
    fetch('http://localhost:3000/posts')
        .then(response => response.json())
        .then(posts => {
            const postList = document.getElementById('post-list');
            postList.innerHTML = '';

            posts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.className = 'post-item';
                postItem.innerHTML = `<h3>${post.title}</h3>`;
                postItem.dataset.id = post.id;

                postItem.addEventListener('click', () => handlePostClick(post.id));
                postList.appendChild(postItem);
            });
        })
        .catch(error => console.error('Error fetching posts:', error));
}

// Show post details
function handlePostClick(postId) {
    fetch(`http://localhost:3000/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            const postDetail = document.getElementById('post-detail');
            postDetail.innerHTML = `
                <div class="post-header">
                    <h2>${post.title}</h2>
                </div>
                <p><strong>Author:</strong> ${post.author || 'Unknown'}</p>
                <div class="post-content">${post.content || ''}</div>
                <div class="post-actions">
                    <button class="edit-btn" data-id="${post.id}">Edit</button>
                    <button class="delete-btn" data-id="${post.id}">Delete</button>
                </div>
            `;

            document.querySelector('.edit-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                showEditForm(post);
            });

            document.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this post?')) {
                    deletePost(post.id);
                }
            });
        })
        .catch(error => console.error('Error fetching post details:', error));
}

// Show edit form
function showEditForm(post) {
    const editForm = document.getElementById('edit-post-form');
    document.getElementById('edit-title').value = post.title;
    document.getElementById('edit-content').value = post.content;
    editForm.dataset.id = post.id;
    editForm.classList.remove('hidden');
}

// Setup edit form
function setupEditForm() {
    const editForm = document.getElementById('edit-post-form');
    const cancelEdit = document.getElementById('cancel-edit');

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const postId = editForm.dataset.id;
        const updatedPost = {
            title: document.getElementById('edit-title').value,
            content: document.getElementById('edit-content').value
        };

        updatePost(postId, updatedPost);
    });

    cancelEdit.addEventListener('click', () => {
        editForm.classList.add('hidden');
    });
}

// Update post
function updatePost(postId, updatedPost) {
    fetch(`http://localhost:3000/posts/${postId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPost)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update post');
            }
            return response.json();
        })
        .then(() => {
            displayPosts();
            handlePostClick(postId);
            document.getElementById('edit-post-form').classList.add('hidden');
        })
        .catch(error => {
            console.error('Error updating post:', error);
            alert('Failed to update post. Please try again.');
        });
}

// Delete post
function deletePost(postId) {
    fetch(`http://localhost:3000/posts/${postId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete post');
            }
            displayPosts();
            document.getElementById('post-detail').innerHTML = '<p>Select a post to view details</p>';
        })
        .catch(error => {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        });
}

// Add new post
function addNewPostListener() {
    const form = document.getElementById('new-post-form');
    form.addEventListener('submit', event => {
        event.preventDefault();

        const title = document.getElementById('new-title').value;
        const content = document.getElementById('new-content').value;
        const author = document.getElementById('new-author').value;

        const newPost = {
            title,
            content,
            author
        };

        fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPost)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create post');
                }
                return response.json();
            })
            .then(() => {
                displayPosts();
                form.reset();
            })
            .catch(error => {
                console.error('Error creating post:', error);
                alert('Failed to create post. Please try again.');
            });
    });
}

document.addEventListener('DOMContentLoaded', main);