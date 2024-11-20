
# Node.js API Server

This is a simple Node.js server with RESTful API capabilities. It supports operations like fetching, creating, updating, and deleting items, as well as uploading and serving image files.

## Features
- **GET /items**: Retrieve all items or a specific item by ID.
- **POST /items**: Create a new item with an image upload.
- **PUT /items?id={id}**: Replace an item by ID.
- **PATCH /items?id={id}**: Update specific fields of an item by ID.
- **DELETE /items?id={id}**: Delete an item by ID.
- **GET /uploads/{filename}**: Fetch uploaded images.

## Prerequisites
- Node.js (version 14 or above)

## Setup Instructions

1. Clone the repository or download the source code.
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create necessary files and directories:
    - The script will automatically create an `items.json` file and an `uploads` directory if they don't exist.

4. Start the server:
    ```bash
    node server.js
    ```

5. The server will start on port 3000. You can access it at `http://localhost:3000`.

## API Endpoints

### 1. Fetch All Items
**GET** `/items`

**Response:**
```json
[
    {
        "id": "1",
        "name": "Example Item",
        "imageUrl": "/uploads/example.jpg"
    }
]
```

### 2. Fetch a Specific Item
**GET** `/items?id={id}`

**Response:**
- **200**: Item found.
- **404**: Item not found.

### 3. Create a New Item
**POST** `/items`

**Request Body:**
- Form data with fields:
  - `id`: Unique ID for the item.
  - `name`: Name of the item.
  - `image`: Image file upload.

**Response:**
- **201**: Item created.
```json
{
    "id": "1",
    "name": "Example Item",
    "imageUrl": "/uploads/example.jpg"
}
```

### 4. Update an Item
**PUT** `/items?id={id}`

**Request Body:**
```json
{
    "name": "Updated Name",
    "imageUrl": "/uploads/updated.jpg"
}
```

**Response:**
- **200**: Item updated.
- **404**: Item not found.

### 5. Partially Update an Item
**PATCH** `/items?id={id}`

**Request Body:**
```json
{
    "name": "Partially Updated Name"
}
```

**Response:**
- **200**: Item updated.
- **404**: Item not found.

### 6. Delete an Item
**DELETE** `/items?id={id}`

**Response:**
- **204**: Item deleted.
- **404**: Item not found.

### 7. Fetch Uploaded Images
**GET** `/uploads/{filename}`

**Response:**
- **200**: Image served.
- **404**: Image not found.

## Notes
- Image uploads are saved in the `uploads` directory.
- Data is stored in the `items.json` file in JSON format.

## Error Handling
- Proper HTTP status codes are used for errors like 404 (Not Found) and 500 (Internal Server Error).

## License
This project is open source and available.
