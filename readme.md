

# sikyo (means “Order” in Korean)

**sikyo** is a mobile-first web app for **counting group food and coffee orders**.
It helps teams or friends quickly collect menu choices and quantities when ordering together.

Built with Meteor’s real-time data layer and a modern React + Tailwind CSS v4.1 UI,
*sikyo* focuses on speed, simplicity, and mobile usability.

---

## ✨ Features

### Shop Management

* Create, edit, and delete shops
* Each shop has its own menu list
* Shops are sorted by **recent activity**

### Menu & Order Counting

* Add, edit, and delete menus
* Increment / decrement order counts per menu
* Reset all counts with a single action
* Counts are **stored in MongoDB** and persist across reloads

### Mobile-First UX

* **Swipe left** on list items to reveal edit/delete actions
* Optimized for touch interactions
* Long menu names automatically resize to remain fully visible

### Sharing

* Works on **iOS, Android, and Desktop**
* Uses **native system share sheet** when available
* Fallback to a share modal with link copy
* Shared URL is the current menu page URL

---

## 🛠 Tech Stack

* **Framework**: Meteor 3.3.2
* **Frontend**: React 18
* **Styling**: Tailwind CSS v4.1
* **Database**: MongoDB (Meteor built-in)
* **Icons**: Heroicons
* **Gestures**: react-swipeable

---

## 📁 Project Structure

```
.
├── client
│   ├── main.html
│   ├── main.css
│   └── main.jsx
├── imports
│   ├── api
│   │   ├── shops.js
│   │   ├── menus.js
│   │   ├── publications.js
│   │   └── methods.js
│   └── ui
│       ├── components
│       │   ├── SwipeRow.jsx
│       │   ├── TopBar.jsx
│       │   └── ...
│       └── pages
│           ├── ShopsPage.jsx
│           └── ShopMenusPage.jsx
├── server
│   ├── main.js
│   └── initData.js
└── tests
```

---

## 🚀 Getting Started

### 1. Install Meteor

```bash
curl https://install.meteor.com/ | sh
```

### 2. Run the app

```bash
meteor run
```

Default URL:

```
http://localhost:3000
```

> ⚠️ **iOS native sharing requires HTTPS**
> For testing on mobile, use tools like **ngrok** or **Cloudflare Tunnel**.

---

## 🌱 Dummy Data Initialization

The project includes a realistic data seeder.

* Categories: **Cafe / Lunch / Fast Food**
* Realistic shop and menu names
* All documents include `createdAt` and `updatedAt`

```js
import { initData } from "/server/initData";

await initData();
```

> This will **delete all existing data** before inserting new dummy data.

---

## 🔄 Data Rules

* Every document includes:

    * `createdAt`
    * `updatedAt`
* **Shop lists** are sorted by `updatedAt DESC`
* **Menu lists** are sorted by `createdAt DESC`
* Any update:

    * Refreshes `updatedAt` on the modified document
    * Menu updates also refresh the parent shop’s `updatedAt`

---

## 📱 Share Behavior

1. If `navigator.share` is supported

    * Opens the **native system share sheet** (iOS / Android / Desktop)
2. If the user cancels the share

    * No additional UI is shown
3. If sharing is not supported

    * A custom **share modal** with link copy is displayed

---

## 🔓 License

MIT License

Free to use, modify, and distribute.
Commercial use is allowed.

---

## 🤝 Contributing

Contributions are welcome!

Ideas for extension:

* Order sessions (multiple rounds of orders)
* User participation / identity
* PWA / installable app
* Export or summary views

Feel free to open issues or pull requests.

---

## 📌 Project Name

**sikyo**

From the Korean word *“시켜”*
— the most natural thing people say when placing group orders.

---
