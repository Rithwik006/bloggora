import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import SearchModal from './components/SearchModal';
import Home from './pages/Home';
import Posts from './pages/Posts';
import SinglePost from './pages/SinglePost';
import Auth from './pages/Auth';
import CreateEditPost from './pages/CreateEditPost';
import Profile from './pages/Profile';
import Archive from './pages/Archive';
import Bookmarks from './pages/Bookmarks';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<SinglePost />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create-post" element={<CreateEditPost />} />
            <Route path="/edit-post/:id" element={<CreateEditPost />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
          </Routes>
        </main>
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </Router>
    </AuthProvider>
  );
}

export default App;
