// ======================================================
// PRODUCT EXPLORER
// Smart Price Finder
// ======================================================


// ------------------------------------------------------
// 1. GET ALL PRODUCTS FROM NESTED DATA
// ------------------------------------------------------

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


// ------------------------------------------------------
// 2. SORT PRODUCTS BY PRICE
// ------------------------------------------------------
//
// We sort only ONCE when the application loads.
//
// This allows us to use Binary Search later.
//
// ------------------------------------------------------

const productsByPrice = [...allProducts].sort(
  (a, b) => a.price - b.price
);


// Example:
//
// ₹699
// ₹799
// ₹899
// ₹1299
// ₹3999
// ₹6999
// ...
// ₹124999
//
// ------------------------------------------------------


// ======================================================
// 3. BINARY SEARCH - LOWER BOUND
// ======================================================
//
// Finds the first product whose price >= target.
//
// Time Complexity: O(log n)
// ======================================================

function lowerBound(products, target) {

  let left = 0;
  let right = products.length;

  while (left < right) {

      const mid = Math.floor((left + right) / 2);

      if (products[mid].price < target) {

          left = mid + 1;

      } else {

          right = mid;

      }

  }

  return left;
}


// ======================================================
// 4. FIND CLOSEST PRODUCTS
// ======================================================
//
// We first use Binary Search to find the position where
// the target price would exist.
//
// Then we expand left/right from that position.
//
// This avoids checking every product.
//
// Complexity:
//
// Binary Search = O(log n)
// Finding k products = O(k)
//
// Total = O(log n + k)
// ======================================================

function findClosestProducts(target, count = 3) {

  if (productsByPrice.length === 0) {
      return [];
  }


  // Find insertion position

  let index = lowerBound(
      productsByPrice,
      target
  );


  let left = index - 1;
  let right = index;

  const result = [];


  while (
      result.length < count &&
      (left >= 0 || right < productsByPrice.length)
  ) {

      // No right product
      if (right >= productsByPrice.length) {

          result.push(productsByPrice[left]);

          left--;

      }

      // No left product
      else if (left < 0) {

          result.push(productsByPrice[right]);

          right++;

      }

      // Compare left and right products
      else {

          const leftDifference =
              Math.abs(
                  productsByPrice[left].price - target
              );


          const rightDifference =
              Math.abs(
                  productsByPrice[right].price - target
              );


          if (leftDifference <= rightDifference) {

              result.push(productsByPrice[left]);

              left--;

          } else {

              result.push(productsByPrice[right]);

              right++;

          }

      }

  }


  return result;
}


// ======================================================
// 5. FIND PRODUCTS IN PRICE RANGE
// ======================================================
//
// Instead of checking every product:
//
// minPrice <= product.price <= maxPrice
//
// we use two Binary Searches.
//
// Complexity: O(log n + k)
// ======================================================

function findProductsInRange(minPrice, maxPrice) {

  if (minPrice > maxPrice) {

      [minPrice, maxPrice] =
          [maxPrice, minPrice];

  }


  const startIndex =
      lowerBound(
          productsByPrice,
          minPrice
      );


  const endIndex =
      upperBound(
          productsByPrice,
          maxPrice
      );


  return productsByPrice.slice(
      startIndex,
      endIndex
  );
}


// ======================================================
// 6. UPPER BOUND
// ======================================================
//
// Finds the first product whose price > target.
//
// Used for range search.
// ======================================================

function upperBound(products, target) {

  let left = 0;
  let right = products.length;

  while (left < right) {

      const mid =
          Math.floor((left + right) / 2);


      if (products[mid].price <= target) {

          left = mid + 1;

      } else {

          right = mid;

      }

  }

  return left;
}


// ======================================================
// 7. FORMAT PRICE
// ======================================================

function formatPrice(price) {

  return new Intl.NumberFormat(
      "en-IN",
      {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
      }
  ).format(price);

}


// ======================================================
// 8. DISPLAY PRODUCTS
// ======================================================

function displayProducts(products, title) {

  const container =
      document.getElementById(
          "productContainer"
      );


  const resultTitle =
      document.getElementById(
          "resultTitle"
      );


  const resultCount =
      document.getElementById(
          "resultCount"
      );


  resultTitle.textContent = title;

  resultCount.textContent =
      `${products.length} product${
          products.length !== 1 ? "s" : ""
      }`;


  container.innerHTML = "";


  if (products.length === 0) {

      container.innerHTML = `
          <div class="empty-state">
              <h3>No products found</h3>
              <p>
                  Try a different price or price range.
              </p>
          </div>
      `;

      return;
  }


  for (const product of products) {

      const card =
          document.createElement("div");

      card.className = "product-card";


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

          <div class="price">
              ${formatPrice(product.price)}
          </div>

          <div class="rating">
              ★ ${product.rating}
              <span>
                  (${product.reviews} reviews)
              </span>
          </div>

          <div class="stock">
              ${product.stock} units available
          </div>

          <button
              class="view-btn"
              data-id="${product.id}"
          >
              View Product
          </button>

      `;


      container.appendChild(card);

  }

}


// ======================================================
// 9. PRICE SEARCH
// ======================================================

function searchByPrice() {

  const input =
      document.getElementById(
          "targetPrice"
      );


  const target =
      Number(input.value);


  if (!target || target < 0) {

      alert(
          "Please enter a valid price."
      );

      return;
  }


  const closestProducts =
      findClosestProducts(
          target,
          3
      );


  displayProducts(
      closestProducts,
      `Closest Products to ${formatPrice(target)}`
  );

}


// ======================================================
// 10. RANGE SEARCH
// ======================================================

function searchByRange() {

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


  if (
      minInput.value === "" ||
      maxInput.value === "" ||
      minPrice < 0 ||
      maxPrice < 0
  ) {

      alert(
          "Please enter valid minimum and maximum prices."
      );

      return;
  }


  const products =
      findProductsInRange(
          minPrice,
          maxPrice
      );


  displayProducts(
      products,
      `Products from ${formatPrice(
          Math.min(minPrice, maxPrice)
      )} to ${formatPrice(
          Math.max(minPrice, maxPrice)
      )}`
  );

}


// ======================================================
// 11. VIEW PRODUCT
// ======================================================

function viewProduct(productId) {

  const product =
      allProducts.find(
          p => p.id === productId
      );


  if (!product) {
      return;
  }


  const modal =
      document.getElementById(
          "productModal"
      );


  const modalBody =
      document.getElementById(
          "modalBody"
      );


  let specifications = "";


  for (
      const [key, value]
      of Object.entries(product.specifications)
  ) {

      specifications += `

          <div>
              <span>
                  ${formatSpecificationName(key)}
              </span>

              <strong>
                  ${value}
              </strong>
          </div>

      `;

  }


  modalBody.innerHTML = `

      <div class="product-category">
          ${product.category}
      </div>

      <h2>
          ${product.name}
      </h2>

      <p class="brand">
          Brand: ${product.brand}
      </p>

      <div class="modal-price">
          ${formatPrice(product.price)}
      </div>

      <p>
          ⭐ ${product.rating}
          (${product.reviews} reviews)
      </p>

      <p style="margin-top: 10px;">
          ${product.stock} units available
      </p>

      <div class="specifications">

          <h3>
              Specifications
          </h3>

          ${specifications}

      </div>

  `;


  modal.classList.add("active");

}


// ======================================================
// 12. FORMAT SPECIFICATION NAME
// ======================================================

function formatSpecificationName(name) {

  return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, char => char.toUpperCase());

}


// ======================================================
// 13. EVENT LISTENERS
// ======================================================

document
  .getElementById("searchBtn")
  .addEventListener(
      "click",
      searchByPrice
  );


document
  .getElementById("rangeBtn")
  .addEventListener(
      "click",
      searchByRange
  );


// Press Enter inside target price

document
  .getElementById("targetPrice")
  .addEventListener(
      "keydown",
      event => {

          if (event.key === "Enter") {

              searchByPrice();

          }

      }
  );


// View Product buttons

document
  .getElementById("productContainer")
  .addEventListener(
      "click",
      event => {

          if (
              event.target.classList.contains(
                  "view-btn"
              )
          ) {

              const productId =
                  event.target.dataset.id;


              viewProduct(productId);

          }

      }
  );


// Close modal

document
  .getElementById("closeModal")
  .addEventListener(
      "click",
      () => {

          document
              .getElementById("productModal")
              .classList.remove("active");

      }
  );


// Close modal when clicking outside

document
  .getElementById("productModal")
  .addEventListener(
      "click",
      event => {

          if (
              event.target.id ===
              "productModal"
          ) {

              event.target.classList.remove(
                  "active"
              );

          }

      }
  );


// ======================================================
// 14. INITIAL DISPLAY
// ======================================================

displayProducts(
  productsByPrice.slice(0, 6),
  "Featured Products"
);