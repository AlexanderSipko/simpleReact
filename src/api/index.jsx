import React, { useState, useEffect } from 'react';

function useGetPostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для получения данных
  const fetchPosts = async () => {
    try {
      const response = await fetch('https://api.fake-rest.refine.dev/posts');
      
      // Проверяем, успешен ли ответ
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return [ posts, loading, error]
}

export default useGetPostsList;