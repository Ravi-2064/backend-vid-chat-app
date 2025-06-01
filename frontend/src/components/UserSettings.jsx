import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile, addBlog, updateBlog, deleteBlog } from '../lib/api';
import { X, Save, Plus, Trash2, Edit2 } from 'lucide-react';

const UserSettings = ({ user, onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [newHobby, setNewHobby] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(user.backgroundImage || '');
  const [hobbies, setHobbies] = useState(user.hobbies || []);
  const [blogs, setBlogs] = useState(user.blogs || []);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [error, setError] = useState('');

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      onClose();
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  // Add blog mutation
  const addBlogMutation = useMutation({
    mutationFn: addBlog,
    onSuccess: (newBlog) => {
      setBlogs([...blogs, newBlog]);
      setBlogTitle('');
      setBlogContent('');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: ({ blogId, blogData }) => updateBlog(blogId, blogData),
    onSuccess: (updatedBlog) => {
      setBlogs(blogs.map(blog => 
        blog.id === updatedBlog.id ? updatedBlog : blog
      ));
      setEditingBlogId(null);
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: (deletedBlogId) => {
      setBlogs(blogs.filter(blog => blog.id !== deletedBlogId));
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleAddHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()]);
      setNewHobby('');
    }
  };

  const handleRemoveHobby = (hobbyToRemove) => {
    setHobbies(hobbies.filter(hobby => hobby !== hobbyToRemove));
  };

  const handleAddBlog = () => {
    if (blogTitle.trim() && blogContent.trim()) {
      addBlogMutation.mutate({
        title: blogTitle.trim(),
        content: blogContent.trim()
      });
    }
  };

  const handleUpdateBlog = (blogId) => {
    const blog = blogs.find(b => b.id === blogId);
    if (blog) {
      updateBlogMutation.mutate({
        blogId,
        blogData: {
          title: blogTitle.trim(),
          content: blogContent.trim()
        }
      });
    }
  };

  const handleDeleteBlog = (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      deleteBlogMutation.mutate(blogId);
    }
  };

  const handleSaveChanges = () => {
    updateProfileMutation.mutate({
      backgroundImage,
      hobbies
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customize Your Profile</h2>
          <button onClick={onClose} className="btn btn-ghost btn-circle">
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab ${activeTab === 'blogs' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            Blogs
          </button>
          <button
            className={`tab ${activeTab === 'hobbies' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('hobbies')}
          >
            Hobbies
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Background Image URL</span>
              </label>
              <input
                type="text"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                className="input input-bordered"
                placeholder="Enter image URL"
              />
            </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Blog Title</span>
              </label>
              <input
                type="text"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                className="input input-bordered"
                placeholder="Enter blog title"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Blog Content</span>
              </label>
              <textarea
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                className="textarea textarea-bordered h-32"
                placeholder="Write your blog content here..."
              />
            </div>
            <button
              onClick={handleAddBlog}
              className="btn btn-primary"
              disabled={addBlogMutation.isPending}
            >
              {addBlogMutation.isPending ? 'Adding...' : 'Add Blog'}
            </button>

            <div className="space-y-4 mt-6">
              <h3 className="font-semibold">Your Blogs</h3>
              {blogs.map((blog) => (
                <div key={blog.id} className="card bg-base-200 p-4">
                  {editingBlogId === blog.id ? (
                    <>
                      <input
                        type="text"
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        className="input input-bordered mb-2"
                      />
                      <textarea
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        className="textarea textarea-bordered mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateBlog(blog.id)}
                          className="btn btn-sm btn-primary"
                          disabled={updateBlogMutation.isPending}
                        >
                          {updateBlogMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingBlogId(null)}
                          className="btn btn-sm btn-ghost"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="font-semibold">{blog.title}</h4>
                      <p className="text-sm opacity-70">
                        {new Date(blog.date).toLocaleDateString()}
                      </p>
                      <p className="mt-2">{blog.content}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setEditingBlogId(blog.id);
                            setBlogTitle(blog.title);
                            setBlogContent(blog.content);
                          }}
                          className="btn btn-sm btn-ghost"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="btn btn-sm btn-ghost text-error"
                          disabled={deleteBlogMutation.isPending}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hobbies' && (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Add New Hobby</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  className="input input-bordered flex-1"
                  placeholder="Enter hobby"
                />
                <button onClick={handleAddHobby} className="btn btn-primary">
                  <Plus className="size-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {hobbies.map((hobby) => (
                <div key={hobby} className="badge badge-primary p-4 flex items-center gap-2">
                  {hobby}
                  <button
                    onClick={() => handleRemoveHobby(hobby)}
                    className="btn btn-ghost btn-xs"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="btn btn-primary"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="size-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings; 