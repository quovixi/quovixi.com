document.addEventListener('DOMContentLoaded', function() {
        var year = new Date().getFullYear();
        document.getElementById('year').textContent = year;
    });

const SHEET_ID = '1ETd8ZgatNS7e6_3RkqBF2gzQMsJ5UYpWU9pVJ862cGI'; 
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const RANGE = 'Sheet1!A:F'; 

const itemList = document.getElementById('itemList');
const categoryFilter = document.getElementById('categoryFilter');
const detailsView = document.getElementById('detailsView');
const detailsTitle = document.getElementById('detailsTitle');
const detailsAuthor = document.getElementById('detailsAuthor');
const detailsCategory = document.getElementById('detailsCategory');
const reviewContent = document.getElementById('reviewContent');
const toggleSpoilerFree = document.getElementById('toggleSpoilerFree');
const toggleSpoiler = document.getElementById('toggleSpoiler');

let items = []; 
let currentItem = null; 

async function fetchItems() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.values) {
            items = data.values.slice(1).map(row => ({
                title: row[0] || 'Untitled', 
                author: row[1] || 'Unknown author', 
                category: row[2] || 'Uncategorised', 
                review: row[3] || '', 
                thumbnail: row[4] || '',
            }));

            populateFilters(items); 

            currentOffset = 0; 
            loadItems(items);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function populateFilters(items) {
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    categoryFilter.innerHTML = '<option value="">All categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

let currentOffset = 0; 
const itemsPerPage = 10;

function loadItems(items, filter = {}) {
    const filteredItems = items.filter(item => {
        if (filter.category && item.category !== filter.category) return false;
        return true;
    });

    const itemsToLoad = filteredItems.slice(currentOffset, currentOffset + itemsPerPage);

    const fragment = document.createDocumentFragment();

    itemsToLoad.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.className = 'item';

        let content = '';
        if (item.thumbnail) {
            content += `<img src="${item.thumbnail}" alt="${item.title}" loading="lazy">`;
        }
        content += `
            <div>
                <h3>${item.title}</h3>
                <p>${getAuthorPrefix(item.category)} ${item.author}</p>
                <span class="pill">${item.category}</span>
            </div>
        `;

        itemElement.innerHTML = content;
        itemElement.addEventListener('click', () => showDetails(item));
        fragment.appendChild(itemElement);
    });

    itemList.appendChild(fragment);

    const hasMoreItems = currentOffset + itemsPerPage < filteredItems.length;
    loadMoreButton.style.display = hasMoreItems ? 'block' : 'none';

    currentOffset += itemsToLoad.length;
}


const loadMoreButton = document.createElement('button');
loadMoreButton.id = 'loadMore';
loadMoreButton.textContent = 'Load more';
loadMoreButton.style.display = 'none'; 
loadMoreButton.addEventListener('click', () => {
    loadItems(items, { category: categoryFilter.value });
});
itemList.after(loadMoreButton);

categoryFilter.addEventListener('change', () => {
    currentOffset = 0;
    itemList.innerHTML = '';
    loadItems(items, { category: categoryFilter.value });
});

document.addEventListener('DOMContentLoaded', () => {
    currentOffset = 0; 
    loadItems(items);
});

function showDetails(item) {
currentItem = item; 
detailsTitle.textContent = item.title;
detailsAuthor.textContent = `${getAuthorPrefix(item.category)} ${item.author}`;
reviewContent.innerHTML = item.review;

const hasSpoilers = reviewContent.querySelectorAll('[data-spoiler]').length > 0;

const spoilerToggleContainer = document.querySelector('.spoiler-toggle');
spoilerToggleContainer.style.display = hasSpoilers ? 'flex' : 'none';

if (hasSpoilers) {
    const spoilerToggle = document.getElementById('spoilerToggle');
    spoilerToggle.checked = false;
    toggleSpoilers(false);
}

itemList.style.display = 'none';
detailsView.style.display = 'block';

const loadMoreButton = document.getElementById('loadMore');
loadMoreButton.style.display = 'none';
}

function toggleSpoilers(showSpoilers) {
    const spoilerElements = reviewContent.querySelectorAll('[data-spoiler]');
    spoilerElements.forEach(el => {
        el.style.display = showSpoilers ? 'inline' : 'none';
    });
}

toggleSpoilers(false);

const spoilerToggle = document.getElementById('spoilerToggle');
spoilerToggle.addEventListener('change', () => {
    toggleSpoilers(spoilerToggle.checked);
});

function goBackToList() {
    detailsView.style.display = 'none';
    itemList.style.display = 'block';

    loadItems(items, { category: categoryFilter.value });

    const filteredItems = items.filter(item => {
        if (categoryFilter.value && item.category !== categoryFilter.value) return false;
        return true;
    });

    const loadMoreButton = document.getElementById('loadMore');
    loadMoreButton.style.display =
        currentOffset < filteredItems.length ? 'block' : 'none';
}

function getAuthorPrefix(category) {
    switch (category) {
        case 'Book':
            return 'Author:';
        case 'Film':
            return 'Director:';
        case 'TV Show':
            return 'Creator:';
        case 'Album':
            return 'Artist:';
        case 'Painting':
            return 'Artist:';
        case 'Musical':
            return 'Creator:';
        case 'Podcast':
            return 'Host:';
        case 'Video':
            return 'Creator:';
        default:
            return 'Author:';
    }
}

categoryFilter.addEventListener('change', () => {
    const filter = {
        category: categoryFilter.value,
    };
    loadItems(items, filter);
});

fetchItems();

