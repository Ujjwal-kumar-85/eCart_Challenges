// ==========================================
// CHALLENGE 2
// TOP K POPULAR PRODUCTS
// ==========================================


// ------------------------------------------
// 1. Get all products
// ------------------------------------------

function getAllProducts() {

    const products = [];

    for (const category of storeData.categories) {

        for (const subcategory of category.subcategories) {

            for (const product of subcategory.products) {

                products.push(product);

            }

        }

    }

    return products;
}


// ------------------------------------------
// 2. Calculate popularity
// ------------------------------------------

function getPopularity(product) {

    return product.rating * product.reviews;

}


// ------------------------------------------
// 3. Min Heap
// ------------------------------------------

class MinHeap {

    constructor() {

        this.heap = [];

    }


    size() {

        return this.heap.length;

    }


    peek() {

        return this.heap[0];

    }


    push(item) {

        this.heap.push(item);

        let index = this.heap.length - 1;


        while (index > 0) {

            let parent =
                Math.floor((index - 1) / 2);


            if (
                this.heap[parent].popularity
                <=
                this.heap[index].popularity
            ) {

                break;

            }


            [
                this.heap[parent],
                this.heap[index]
            ] =
            [
                this.heap[index],
                this.heap[parent]
            ];


            index = parent;

        }

    }


    pop() {

        if (this.heap.length === 0) {

            return null;

        }


        if (this.heap.length === 1) {

            return this.heap.pop();

        }


        const root = this.heap[0];


        this.heap[0] = this.heap.pop();


        let index = 0;


        while (true) {

            const left =
                2 * index + 1;

            const right =
                2 * index + 2;


            let smallest = index;


            if (
                left < this.heap.length &&
                this.heap[left].popularity
                <
                this.heap[smallest].popularity
            ) {

                smallest = left;

            }


            if (
                right < this.heap.length &&
                this.heap[right].popularity
                <
                this.heap[smallest].popularity
            ) {

                smallest = right;

            }


            if (smallest === index) {

                break;

            }


            [
                this.heap[index],
                this.heap[smallest]
            ] =
            [
                this.heap[smallest],
                this.heap[index]
            ];


            index = smallest;

        }


        return root;

    }

}


// ------------------------------------------
// 4. Find Top K
// ------------------------------------------

function findTopK(products, k) {

    const minHeap = new MinHeap();


    for (const product of products) {

        const popularity =
            getPopularity(product);


        const item = {

            product: product,

            popularity: popularity

        };


        // First K products
        if (minHeap.size() < k) {

            minHeap.push(item);

        }


        // Replace the smallest
        else if (
            popularity >
            minHeap.peek().popularity
        ) {

            minHeap.pop();

            minHeap.push(item);

        }

    }


    const result = [];


    while (minHeap.size() > 0) {

        result.push(minHeap.pop());

    }


    // Highest popularity first
    result.reverse();


    return result;

}


// ------------------------------------------
// 5. Generate Stars
// ------------------------------------------

function generateStars(rating) {

    const fullStars =
        Math.floor(rating);

    const emptyStars =
        5 - fullStars;


    return (
        "★".repeat(fullStars) +
        "☆".repeat(emptyStars)
    );

}


// ------------------------------------------
// 6. Display Products
// ------------------------------------------

function displayProducts(topProducts) {

    const container =
        document.getElementById(
            "productContainer"
        );


    container.innerHTML = "";


    topProducts.forEach(
        (item, index) => {

            const product =
                item.product;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            card.innerHTML = `

                <span class="rank">
                    #${index + 1}
                </span>


                <h3 class="product-name">
                    ${product.name}
                </h3>


                <p class="brand">
                    Brand: ${product.brand}
                </p>


                <p class="price">
                    ₹${product.price.toLocaleString("en-IN")}
                </p>


                <div class="rating">

                    <span class="stars">
                        ${generateStars(product.rating)}
                    </span>

                    <span class="rating-number">
                        ${product.rating}
                    </span>

                </div>


                <p class="reviews">
                    ${product.reviews.toLocaleString("en-IN")}
                    reviews
                </p>


                <div class="popularity">

                    Popularity Score:

                    <strong>
                        ${item.popularity.toLocaleString("en-IN")}
                    </strong>

                </div>


                <button
                    class="view-btn"
                    onclick="viewProduct('${product.id}')"
                >
                    View Product
                </button>

            `;


            container.appendChild(card);

        }
    );

}


// ------------------------------------------
// 7. View Product
// ------------------------------------------

function viewProduct(productId) {

    const products =
        getAllProducts();


    const product =
        products.find(
            p => p.id === productId
        );


    if (!product) {

        return;

    }


    alert(

        product.name +
        "\n\n" +

        "Brand: " +
        product.brand +

        "\nPrice: ₹" +
        product.price.toLocaleString("en-IN") +

        "\nRating: " +
        product.rating +

        "\nReviews: " +
        product.reviews

    );

}


// ------------------------------------------
// 8. Load Top K
// ------------------------------------------

function loadPopularProducts() {

    const k =
        Number(
            document.getElementById(
                "topK"
            ).value
        );


    const products =
        getAllProducts();


    const topProducts =
        findTopK(
            products,
            k
        );


    displayProducts(
        topProducts
    );

}


// ------------------------------------------
// 9. Dropdown Event
// ------------------------------------------

document
    .getElementById("topK")
    .addEventListener(
        "change",
        loadPopularProducts
    );


// ------------------------------------------
// 10. Initial Load
// ------------------------------------------

loadPopularProducts();