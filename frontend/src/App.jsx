import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Posts from './pages/Posts';
import SinglePost from './pages/SinglePost';
import Auth from './pages/Auth';
import CreateEditPost from './pages/CreateEditPost';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<SinglePost />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-post" element={<CreateEditPost />} />
          <Route path="/edit-post/:id" element={<CreateEditPost />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
