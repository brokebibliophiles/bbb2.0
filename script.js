let allMeetups = [];

async function loadMeetups() {
    try {
        const response = await fetch('meetups.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allMeetups = await response.json();
        
        // Sort meetups by date, most recent first
        allMeetups.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        document.getElementById('search-input').value = ''; // Clear search input
        displayMeetups(allMeetups);
    } catch (error) {
        console.error('Error loading meetups:', error);
        document.getElementById('latest-meetup').innerHTML = '<p>Error loading meetup data. Please try again later.</p>';
        document.getElementById('meetup-list').innerHTML = '';
    }
}

function displayMeetups(meetups) {
    // Display the latest meetup
    const latestMeetup = meetups[0];
    document.getElementById('latest-meetup').innerHTML = generateMeetupHTML(latestMeetup, true);
    
    // Display all meetups
    const meetupListHTML = meetups.map((meetup, index) => `
        <div class="meetup-list-item">
            <a href="#" onclick="showMeetup(${index}); return false;">
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

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function searchMeetups() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredMeetups = allMeetups.filter(meetup => 
        meetup.books.some(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm) ||
            book.genre.toLowerCase().includes(searchTerm)
        )
    );

    if (filteredMeetups.length > 0) {
        // Display the first search result
        document.getElementById('latest-meetup').innerHTML = generateMeetupHTML(filteredMeetups[0], false);
        
        // Display all search results
        const meetupListHTML = filteredMeetups.map((meetup, index) => `
            <div class="meetup-list-item">
                <a href="#" onclick="showMeetup(${allMeetups.indexOf(meetup)}); return false;">
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

    // Highlight search terms
    document.querySelectorAll('.meetup-list-item a').forEach(item => {
        item.innerHTML = item.textContent.replace(new RegExp(searchTerm, 'gi'), match => `<span class="highlight">${match}</span>`);
    });
}

function showMeetup(index) {
    const meetup = allMeetups[index];
    document.getElementById('latest-meetup').innerHTML = generateMeetupHTML(meetup, index === 0);
    window.scrollTo(0, 0);
}

function returnHome() {
    document.getElementById('search-input').value = '';
    loadMeetups();
}

document.addEventListener('DOMContentLoaded', () => {
    loadMeetups();
    document.getElementById('search-button').addEventListener('click', searchMeetups);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMeetups();
        }
    });
});