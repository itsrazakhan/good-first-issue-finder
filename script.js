
// ========================================
// 1. SELECT HTML ELEMENTS
// ========================================

const language = document.querySelector("#language");
const searchBtn = document.querySelector("#searchBtn");
const resultCount = document.querySelector("#resultCount");
const results = document.querySelector("#results");


// ========================================
// 2. SEARCH GITHUB ISSUES
// ========================================

async function searchIssues() {

    const selectedLanguage = language.value;

    // Show loading message
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    resultCount.textContent = "Searching...";
    results.replaceChildren();

    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "Finding beginner-friendly issues...";
    results.appendChild(emptyMessage);

    // Build GitHub API URL
    const query = `is:issue is:open label:"good first issue" language:${selectedLanguage}`;

    const params = new URLSearchParams({
        q: query,
        per_page: "100",
        sort: "updated",
        order: "desc"
    });

    const apiURL = `https://api.github.com/search/issues?${params}`;

    try {

        // Fetch data from GitHub
        const response = await fetch(apiURL);

        const data = await response.json();

        // Check for API errors
        if (!response.ok) {
            throw new Error(data.message || "Something went wrong.");
        }

        // Remove pull requests
        const issues = data.items.filter(issue => !issue.pull_request);

        // Update result count
        resultCount.textContent = `${issues.length} Issues`;

        // Clear previous results
        results.replaceChildren();

        // Check if issues exist
        if (issues.length === 0) {

            const message = document.createElement("p");
            message.className = "empty-state";
            message.textContent = "No beginner-friendly issues found. Try another language.";

            results.appendChild(message);
            return;
        }

        // Create cards for every issue
        issues.forEach(issue => {
            const card = createIssueCard(issue);
            results.appendChild(card);
        });

    } catch (error) {

        console.error("GitHub API Error:", error);

        resultCount.textContent = "0 Issues";
        results.replaceChildren();

        const errorMessage = document.createElement("p");
        errorMessage.className = "empty-state";
        errorMessage.textContent = error.message;

        results.appendChild(errorMessage);

    } finally {

        // Restore search button
        searchBtn.disabled = false;
        searchBtn.textContent = "Find Issues";
    }
}


// ========================================
// 3. CREATE ISSUE CARD
// ========================================

function createIssueCard(issue) {

    // Main card
    const card = document.createElement("article");
    card.className = "issue-card";

    // Top section
    const top = document.createElement("div");
    top.className = "issue-top";

    const status = document.createElement("span");
    status.className = "issue-status";
    status.textContent = "Open";

    const number = document.createElement("span");
    number.className = "issue-number";
    number.textContent = `#${issue.number}`;

    const updated = document.createElement("span");
    updated.className = "issue-updated";

    updated.textContent = `Updated ${new Date(issue.updated_at).toLocaleDateString()}`;

    top.append(status, number, updated);


    // Content section
    const content = document.createElement("div");
    content.className = "issue-content";

    const title = document.createElement("h3");
    title.className = "issue-title";
    title.textContent = issue.title;

    const description = document.createElement("p");
    description.className = "issue-description";

    description.textContent = issue.body
        ? issue.body.replace(/\s+/g, " ").trim().slice(0, 180) + "..."
        : "No description provided.";

    content.append(title, description);


    // Labels section
    const labelsContainer = document.createElement("div");
    labelsContainer.className = "issue-labels";

    issue.labels.forEach(label => {

        const labelElement = document.createElement("span");
        labelElement.className = "label";

        const labelName = label.name.toLowerCase();

        if (labelName.includes("good first issue")) {
            labelElement.classList.add("beginner");
        }

        if (labelName.includes("bug")) {
            labelElement.classList.add("bug");
        }

        labelElement.textContent = label.name;

        labelsContainer.appendChild(labelElement);
    });

    // Selected repository language
    const languageLabel = document.createElement("span");
    languageLabel.className = "label language";
    languageLabel.textContent = language.value;

    labelsContainer.appendChild(languageLabel);

    content.appendChild(labelsContainer);


    // Footer section
    const footer = document.createElement("div");
    footer.className = "issue-footer";

    const author = document.createElement("div");
    author.className = "issue-author";

    const avatar = document.createElement("img");
    avatar.src = issue.user.avatar_url;
    avatar.alt = `${issue.user.login}'s avatar`;
    avatar.loading = "lazy";

    const authorInfo = document.createElement("a");
    authorInfo.className = "author-info";
    authorInfo.textContent = issue.user.login;
    authorInfo.href = issue.user.html_url;
    authorInfo.target = "_blank";

    author.append(avatar, authorInfo);

    // GitHub issue link
    const link = document.createElement("a");
    link.className = "github-link";
    link.href = issue.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View Issue →";

    footer.append(author, link);


    // Put everything inside the card
    card.append(top, content, footer);

    return card;
}


// ========================================
// 4. BUTTON EVENT LISTENER
// ========================================

searchBtn.addEventListener("click", searchIssues);
