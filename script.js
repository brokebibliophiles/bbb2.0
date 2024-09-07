let pageContent = {};

async function loadContent(page) {
    try {
        const response = await fetch(`${page}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.json();
        pageContent[page] = content;
        if (page === 'meetups') {
            displayMeetups(content);
        } else {
            displayContent(page);
        }
    } catch (error) {
        console.error(`Error loading ${page} content:`, error);
        document.getElementById('content-list').innerHTML = `<p>Error loading ${page} data. Please try again later.</p>`;
    }
}

function displayContent(page) {
    const contentHTML = pageContent[page].map(item => `
        <div class="content-item">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <small>${formatDate(item.date)}</small>
        </div>
    `).join('');

    document.getElementById('content-list').innerHTML = contentHTML;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Meetup-specific functions
function displayMeetups(meetups) {
    meetups.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const latestMeetup = meetups[0];
    document.getElementById('latest-meetup').innerHTML = generateMeetupHTML(latestMeetup, true);
    
    const meetupListHTML = meetups.slice(1).map((meetup, index) => `
        <div class="meetup-list-item">
            <a href="#" onclick="showMeetup(${index + 1}); return false;">
                ${formatDate(meetup.date)}: ${meetup.books.map(book => book.title).join(', ')}
            </a>
        </div>
    `).join('');

    document.getElementById('meetup-list').innerHTML = `
        <h2>All Meetups</h2>
        ${meetupListHTML}
    `;
}

function generateMeetupHTML(meetup, isLatest = false) {
    const title = isLatest ? 'Latest Meetup' : `Meetup on ${formatDate(meetup.date)}`;
    const booksHTML = `
        <table class="book-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                </tr>
            </thead>
            <tbody>
                ${meetup.books.map(book => `
                    <tr>
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>${book.genre}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    return `
        <div class="meetup">
            <h2>${title}</h2>
            <p>Date: ${formatDate(meetup.date)}</p>
            <p>Location: ${meetup.location}</p>
            <h3>Books:</h3>
            ${booksHTML}
        </div>
    `;
}

function showMeetup(index) {
    const meetup = pageContent['meetups'][index];
    document.getElementById('latest-meetup').innerHTML = generateMeetupHTML(meetup, index === 0);
    window.scrollTo(0, 0);
}

function searchMeetups() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredMeetups = pageContent['meetups'].filter(meetup => 
        meetup.books.some(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm) ||
            book.genre.toLowerCase().includes(searchTerm)
        )
    );

    if (filteredMeetups.length > 0) {
        document.getElementById('latest-meetup').innerHTML = generateMeetupHTML(filteredMeetups[0], false);
        
        const meetupListHTML = filteredMeetups.slice(1).map((meetup, index) => `
            <div class="meetup-list-item">
                <a href="#" onclick="showMeetup(${pageContent['meetups'].indexOf(meetup)}); return false;">
                    ${formatDate(meetup.date)}: ${meetup.books.map(book => book.title).join(', ')}
                </a>
            </div>
        `).join('');
        
        document.getElementById('meetup-list').innerHTML = `
            <h2>Search Results</h2>
            ${meetupListHTML}
        `;
    } else {
        document.getElementById('latest-meetup').innerHTML = '<p>No meetups found matching your search.</p>';
        document.getElementById('meetup-list').innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    if (['about', 'contact', 'lists', 'events', 'meetups'].includes(currentPage)) {
        loadContent(currentPage);
    }

    if (currentPage === 'meetups') {
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', searchMeetups);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchMeetups();
                }
            });
        }
    }
});