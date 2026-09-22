// =====================================================
// TECHMART
// INVENTORY RANGE DASHBOARD
// =====================================================


// =====================================================
// 1. FLATTEN THE NESTED DATA
// =====================================================

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


const allProducts = getAllProducts();


// =====================================================
// 2. SORT PRODUCTS BY PRICE
// =====================================================
//
// We sort only once.
//
// Future range queries can then use Binary Search.
//
// =====================================================

const productsByPrice = [...allProducts].sort(
    (a, b) => a.price - b.price
);


// =====================================================
// 3. CREATE PREFIX SUM ARRAYS
// =====================================================
//
// inventoryValue = price × stock
//
// Example:
//
// Product 1
// price = 6999
// stock = 17
//
// inventory = 6999 × 17
//
// We store cumulative inventory values.
//
// prefixInventory[i]
// = total inventory value from
//   product 0 to product i-1
//
// =====================================================

const prefixInventory = [0];


// Total number of units
// is also useful for the dashboard.

const prefixStock = [0];


for (const product of productsByPrice) {

    const inventoryValue =
        product.price * product.stock;


    const previousInventory =
        prefixInventory[
            prefixInventory.length - 1
        ];


    const previousStock =
        prefixStock[
            prefixStock.length - 1
        ];


    prefixInventory.push(
        previousInventory + inventoryValue
    );


    prefixStock.push(
        previousStock + product.stock
    );

}


// =====================================================
// 4. LOWER BOUND
// =====================================================
//
// Finds first index where:
//
// product.price >= target
//
// Complexity: O(log n)
//
// =====================================================

function lowerBound(target) {

    let left = 0;

    let right = productsByPrice.length;


    while (left < right) {

        const mid =
            Math.floor(
                (left + right) / 2
            );


        if (
            productsByPrice[mid].price
            < target
        ) {

            left = mid + 1;

        } else {

            right = mid;

        }

    }


    return left;

}


// =====================================================
// 5. UPPER BOUND
// =====================================================
//
// Finds first index where:
//
// product.price > target
//
// Complexity: O(log n)
//
// =====================================================

function upperBound(target) {

    let left = 0;

    let right = productsByPrice.length;


    while (left < right) {

        const mid =
            Math.floor(
                (left + right) / 2
            );


        if (
            productsByPrice[mid].price
            <= target
        ) {

            left = mid + 1;

        } else {

            right = mid;

        }

    }


    return left;

}


// =====================================================
// 6. INVENTORY RANGE QUERY
// =====================================================
//
// This is the main DSA function.
//
// Instead of:
//
// for every product
//     if price is in range
//         calculate inventory
//
// We do:
//
// start = lowerBound(minPrice)
// end   = upperBound(maxPrice)
//
// Then:
//
// inventoryValue =
// prefixInventory[end]
// - prefixInventory[start]
//
// Complexity:
//
// O(log n)
//
// =====================================================

function analyzeInventory(
    minPrice,
    maxPrice
) {

    // Handle reversed input

    if (minPrice > maxPrice) {

        [
            minPrice,
            maxPrice
        ] = [
            maxPrice,
            minPrice
        ];

    }


    // Find range boundaries

    const startIndex =
        lowerBound(minPrice);


    const endIndex =
        upperBound(maxPrice);


    // Number of products

    const productCount =
        endIndex - startIndex;


    // Total inventory value

    const inventoryValue =
        prefixInventory[endIndex]
        -
        prefixInventory[startIndex];


    // Total stock units

    const totalUnits =
        prefixStock[endIndex]
        -
        prefixStock[startIndex];


    // Matching products

    const matchingProducts =
        productsByPrice.slice(
            startIndex,
            endIndex
        );


    return {

        productCount,

        inventoryValue,

        totalUnits,

        matchingProducts,

        startIndex,

        endIndex

    };

}


// =====================================================
// 7. FORMAT CURRENCY
// =====================================================

function formatPrice(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",

            currency: "INR",

            maximumFractionDigits: 0
        }
    ).format(value);

}


// =====================================================
// 8. UPDATE DASHBOARD
// =====================================================

function updateDashboard(
    minPrice,
    maxPrice
) {

    const result =
        analyzeInventory(
            minPrice,
            maxPrice
        );


    // Summary cards

    document.getElementById(
        "productCount"
    ).textContent =
        result.productCount;


    document.getElementById(
        "inventoryValue"
    ).textContent =
        formatPrice(
            result.inventoryValue
        );


    document.getElementById(
        "totalUnits"
    ).textContent =
        result.totalUnits;


    // Range text

    document.getElementById(
        "rangeText"
    ).textContent =

        `${formatPrice(minPrice)}
        - ${formatPrice(maxPrice)}`;


    document.getElementById(
        "resultCount"
    ).textContent =

        `${result.productCount} product${
            result.productCount !== 1
                ? "s"
                : ""
        }`;


    // Display products

    displayProducts(
        result.matchingProducts
    );

}


// =====================================================
// 9. DISPLAY PRODUCTS
// =====================================================

function displayProducts(products) {

    const container =
        document.getElementById(
            "productList"
        );


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No Products Found
                </h3>

                <p>
                    No products exist in this price range.
                </p>

            </div>

        `;

        return;

    }


    for (const product of products) {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        const inventoryValue =
            product.price *
            product.stock;


        card.innerHTML = `

            <div class="product-category">

                ${product.category}

            </div>


            <h3>

                ${product.name}

            </h3>


            <p class="brand">

                Brand: ${product.brand}

            </p>


            <div class="product-price">

                ${formatPrice(
                    product.price
                )}

            </div>


            <div class="product-stock">

                Stock:
                ${product.stock} units

            </div>


            <div class="inventory-value">

                Inventory Value:
                ${formatPrice(
                    inventoryValue
                )}

            </div>

        `;


        container.appendChild(card);

    }

}


// =====================================================
// 10. MANUAL SEARCH
// =====================================================

function handleSearch() {

    const minInput =
        document.getElementById(
            "minPrice"
        );


    const maxInput =
        document.getElementById(
            "maxPrice"
        );


    const minPrice =
        Number(minInput.value);


    const maxPrice =
        Number(maxInput.value);


    // Validation

    if (
        minInput.value === "" ||
        maxInput.value === ""
    ) {

        alert(
            "Please enter both prices."
        );

        return;

    }


    if (
        minPrice < 0 ||
        maxPrice < 0
    ) {

        alert(
            "Price cannot be negative."
        );

        return;

    }


    updateDashboard(
        minPrice,
        maxPrice
    );


    // Synchronize sliders

    setSliderValues(
        minPrice,
        maxPrice
    );

}


// =====================================================
// 11. SLIDER
// =====================================================

const minSlider =
    document.getElementById(
        "minSlider"
    );


const maxSlider =
    document.getElementById(
        "maxSlider"
    );


// Update slider UI

function updateSliderDisplay(
    minPrice,
    maxPrice
) {

    document.getElementById(
        "sliderValue"
    ).textContent =

        `${formatPrice(minPrice)}
        - ${formatPrice(maxPrice)}`;


    document.getElementById(
        "minSliderValue"
    ).textContent =
        formatPrice(minPrice);


    document.getElementById(
        "maxSliderValue"
    ).textContent =
        formatPrice(maxPrice);

}


// =====================================================
// 12. SET SLIDER VALUES
// =====================================================

function setSliderValues(
    minPrice,
    maxPrice
) {

    const sliderMaximum =
        Number(
            minSlider.max
        );


    minSlider.value =
        Math.min(
            minPrice,
            sliderMaximum
        );


    maxSlider.value =
        Math.min(
            maxPrice,
            sliderMaximum
        );


    updateSliderDisplay(
        Number(minSlider.value),
        Number(maxSlider.value)
    );

}


// =====================================================
// 13. MIN SLIDER EVENT
// =====================================================

minSlider.addEventListener(
    "input",
    () => {

        let minPrice =
            Number(
                minSlider.value
            );


        let maxPrice =
            Number(
                maxSlider.value
            );


        // Don't allow min > max

        if (minPrice > maxPrice) {

            minPrice = maxPrice;

            minSlider.value =
                maxPrice;

        }


        updateSliderDisplay(
            minPrice,
            maxPrice
        );


        // Live update

        updateDashboard(
            minPrice,
            maxPrice
        );

    }
);


// =====================================================
// 14. MAX SLIDER EVENT
// =====================================================

maxSlider.addEventListener(
    "input",
    () => {

        let minPrice =
            Number(
                minSlider.value
            );


        let maxPrice =
            Number(
                maxSlider.value
            );


        // Don't allow max < min

        if (maxPrice < minPrice) {

            maxPrice = minPrice;

            maxSlider.value =
                minPrice;

        }


        updateSliderDisplay(
            minPrice,
            maxPrice
        );


        // Live update

        updateDashboard(
            minPrice,
            maxPrice
        );

    }
);


// =====================================================
// 15. SEARCH BUTTON
// =====================================================

document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        handleSearch
    );


// =====================================================
// 16. ENTER KEY SUPPORT
// =====================================================

document
    .getElementById("minPrice")
    .addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                handleSearch();

            }

        }
    );


document
    .getElementById("maxPrice")
    .addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                handleSearch();

            }

        }
    );


// =====================================================
// 17. INITIAL SLIDER DISPLAY
// =====================================================

updateSliderDisplay(
    0,
    150000
);