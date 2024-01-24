document.addEventListener('DOMContentLoaded', function () {
  // Envs
  // ----------------

  const apiUrl = 'http://localhost:8000/wp-json/custom/v1';

  // ----------------

  // Elements
  // ----------------

  const postsElement = document.querySelector('#posts');
  const filtersSubmit = document.querySelector('#filtersSubmit');
  const loading = document.querySelector('#loading');
  const categoriesGroup = document.querySelector('#categoriesGroup');
  const categoriesInput = document.querySelector('#categoriesInput');
  const categoriesElement = document.querySelector('#categories');
  const categoryClear = document.querySelector('#categoryClear');
  const loadMore = document.querySelector('#loadMore');
  // ----------------

  // Store
  // ----------------

  let categories = [];

  const filters = {
    category: null,
    limit: 3,
    page: 1,
  };

  // ----------------

  // Functions
  // ----------------

  function renderCategories(data, parentElement, history = []) {
    if (!Array.isArray(data)) {
      return;
    }

    parentElement.innerHTML = '';

    data.forEach((item) => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('select-dropdown__item');

      if (item.childrens && item.childrens.length > 0) {
        itemElement.innerHTML = `
          ${item.name}
          <svg class="arrow arrow--right" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12.5L10 7.5L15 12.5" stroke="#302F2D" stroke-width="2"/>
          </svg>
        `;

        itemElement.addEventListener('click', () => {
          history.push(data);
          renderCategories(item.childrens, parentElement, history);
        });
      } else {
        itemElement.textContent = item.name;
        itemElement.addEventListener('click', () => {
          filters.category = item.id;
          categoriesElement.classList.add('none');
          categoriesInput.value = item.name;
        });
      }

      parentElement.appendChild(itemElement);
    });

    if (history.length > 0) {
      const backButton = document.createElement('div');
      backButton.classList.add('select-dropdown__back');
      backButton.innerHTML = `
          <svg class="arrow arrow--left" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12.5L10 7.5L15 12.5" stroke="#302F2D" stroke-width="2"/>
          </svg>
          Назад
        `;
      backButton.addEventListener('click', () => {
        const prevLevel = history.pop();
        renderCategories(prevLevel, parentElement, history);
      });
      parentElement.insertBefore(backButton, parentElement.firstChild);
    }
  }

  const renderPosts = (posts) => {
    postsElement.innerHTML = postsMarkup(posts);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const f = (n) => String(n).padStart(2, '0');

    return `${f(d.getDate())}.${f(d.getMonth() + 1)}.${f(d.getDay())}, ${f(
      d.getHours()
    )}:${f(d.getMinutes())}`;
  };

  // Markups
  // ----------------

  const postsMarkup = (posts) => {
    const postsToRender = [];

    posts.forEach((post) => {
      const { image, date, title, categories, preview_text, author } = {
        ...post,
        date: formatDate(post.date),
        categories: post.categories
          .map(
            (category) => `<div class="post-categories__item">${category}</div>`
          )
          .join('•'),
      };

      postsToRender.push(`
        <div class="post">
          ${
            image
              ? `<img class="post__image" src="${image}" alt="${title}">`
              : `<div class="post__image post__image--not">Нет изображения</div>`
          }
  
          <div class="post-body">
            <div class="post-content">
              <div class="post-content__date">${date}</div>
    
              <div class="post-categories">${categories}</div>
              
              <h2 class="post-content__title">${title}</h2>
              <p class="post-content__excerpt">${preview_text}</p>
            </div>
            
            <div class="post__author">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2C5.584 2 2 5.584 2 10C2 14.416 5.584 18 10 18C14.416 18 18 14.416 18 10C18 5.584 14.416 2 10 2ZM10 3.06667C13.824 3.06667 16.9333 6.176 16.9333 10C16.9333 11.4773 16.4693 12.8427 15.68 13.968L12.224 12.6507C12.224 12.6507 11.8187 11.8187 11.8667 11.696L11.4667 11.584L11.3973 10.9493C11.3973 10.9493 11.7333 10.752 11.92 9.648C11.92 9.648 12.0427 9.82933 12.1707 9.52533C12.2987 9.22133 12.6667 7.81333 12.272 8.07467C12.272 8.07467 13.12 4.91733 9.93067 4.73067C6.74667 4.912 7.6 8.06933 7.6 8.06933C7.20533 7.81333 7.57333 9.216 7.70133 9.52C7.82933 9.824 7.952 9.64267 7.952 9.64267C8.13867 10.752 8.47467 10.944 8.47467 10.944L8.40533 11.5787L8.00533 11.6907C8.05867 11.8133 7.648 12.6453 7.648 12.6453L4.288 13.9307C3.51467 12.8107 3.06133 11.4613 3.06133 10C3.06667 6.176 6.176 3.06667 10 3.06667ZM9.94667 4.72533H9.94133H9.936H9.94667Z" fill="#302F2D"/>
              </svg>
              ${author}
            </div>
          </div>
        </div>`);
    });

    return postsToRender.join('');
  };

  // ----------------

  // Actions
  // ----------------

  const getCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);

      const data = await response.json();

      categories = data.categories;
      renderCategories(categories, categoriesElement);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getPosts = async () => {
    loading.classList.remove('none');
    filtersSubmit.disabled = true;

    try {
      const response = await fetch(
        `${apiUrl}/posts?${new URLSearchParams(
          Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v != null)
          )
        )}`
      );

      const data = await response.json();

      renderPosts(data.posts);
      countOfPosts = data.count;

      if (data.posts.length === data.count) {
        loadMore.classList.add('none');
      } else {
        loadMore.classList.remove('none');
      }

      loading.classList.add('none');
      filtersSubmit.disabled = false;
    } catch (error) {
      console.log('error');
    }
  };

  // ----------------

  // Events
  // ----------------

  filtersSubmit.addEventListener('click', () => getPosts());

  categoriesInput.addEventListener('focus', () => {
    categoriesElement.classList.remove('none');
    categoriesGroup.classList.add('select__group--active');
  });

  categoryClear.addEventListener('click', () => {
    categoriesInput.value = '';
    filters.category = null;
    categoriesElement.classList.add('none');
    categoriesGroup.classList.remove('select__group--active');
  });

  categoriesInput.addEventListener('input', (event) => {
    console.log('Тут должен быть поиск');
  });

  document.addEventListener('click', function (event) {
    const target = event.target;
    const isSelect = target.closest('.select');
    const isDropdownBack = target.closest('.select-dropdown__back');
    const isDropdownItem = target.closest('.select-dropdown__item');

    if (!isSelect && !isDropdownBack && !isDropdownItem) {
      categoriesElement.classList.add('none');
      categoriesGroup.classList.remove('select__group--active');
    }
  });

  loadMore.addEventListener('click', () => {
    filters.limit += filters.limit;
    getPosts();
  });

  // ----------------

  (async () => {
    await getCategories();
    await getPosts();
  })();
});
