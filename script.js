// get HTML
const productList = document.getElementById("product-list");

// get data
const getData = async () => {
  await fetch("./data.json")
    .then((response) => response.json())
    .then((data) => {
      productsArray = data;
      addToHtml();
    });
};

getData();

let productsArray = [];
let basket = JSON.parse(localStorage.getItem("data")) || [];

const addToHtml = () => {
  let displayList = productsArray.map((product) => {
    let returnData = basket.find((x) => x.id === product.id) || [];
    return /*HTML*/ `
    <li class="space-y-8">
            <section class="relative">
              <!-- product image -->
              <picture>
                <source
                  media="(min-width: 960px)"
                  srcset="${product.image.desktop}"
                />
                <source
                  media="(min-width: 640px)"
                  srcset="${product.image.tablet}"
                />
                <img
                  src="${product.image.mobile}"
                  alt=""
                  class="w-full h-56 rounded-md object-cover"
                />
              </picture>
              <!-- product image end -->
              <!-- call to action -->
              <div
                class="absolute rounded-full h-11 w-[64.5%] bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white overflow-hidden border border-rose500"
              >
                <!-- add to cart -->
                <button onclick="updateCartBtn(this)"
                  class="cart-btn flex items-center justify-center gap-1 w-full h-full text-sm font-medium [&_ion-icon]:text-2xl [&_ion-icon]:text-red"
                >
                  <ion-icon name="cart-outline"></ion-icon>
                  <span>Add to Cart</span>
                </button>
                <!-- quantity -->
                 <div class="hidden items-center gap-2 justify-evenly bg-red text-white inset-0 absolute [&_ion-icon]:text-lg [&_ion-icon]:cursor-pointer [&_ion-icon]:border-white [&_ion-icon]:border-[1.75px] [&_ion-icon]:rounded-full">
                    <ion-icon name="remove-outline" onclick="decrement(${
                      product.id
                    })"></ion-icon>
                    <span id="${product.id}" class="quantity select-none">
                    ${returnData.item === undefined ? 0 : returnData.item}
                    </span>
                    <ion-icon name="add-outline" onclick="increment(${
                      product.id
                    })"></ion-icon>
                 </div>
              </div>
              <!-- call to action end -->
            </section>

            <section>
              <p
                data-category
                class="capitalize font-normal text-sm text-rose400"
              >
                ${product.category}
              </p>
              <p data-name class="text-lg leading-6 font-medium text-rose900">
              ${product.name}
              </p>
              <p data-price class="text-xl font-medium text-red">
              $${product.price}
              </p>
            </section>
          </li>`;
  });
  displayList = displayList.join("");
  productList.innerHTML = displayList;
};

const updateCartBtn = (btn) => {
  let clickedBtn = btn;
  let quantityReg = btn.nextElementSibling;
  let productId = quantityReg.querySelector("span");
  let parentElem = btn.parentElement;
  let productImg = parentElem.parentElement.querySelector("picture img");

  const addToCart = (btn) => {
    // remove border from btn
    parentElem.classList.remove("border");
    // add border to product image
    productImg.classList.add("border-2");
    productImg.classList.add("border-red");
    // hide add-to-cart btn
    btn.classList.remove("flex");
    btn.classList.add("hidden");
    // display quantity regulator
    quantityReg.classList.remove("hidden");
    quantityReg.classList.add("flex");

    // increment item quantity
    increment(productId);
  };

  let content = Number(productId.innerHTML);

  if (parentElem.classList.contains("border")) {
    addToCart(clickedBtn);
  } else if (content === 1) {
    // remove border from btn
    parentElem.classList.add("border");
    // add border to product image
    productImg.classList.remove("border-2");
    productImg.classList.remove("border-red");
    // hide add-to-cart btn
    btn.classList.add("flex");
    btn.classList.remove("hidden");
    // display quantity regulator
    quantityReg.classList.add("hidden");
    quantityReg.classList.remove("flex");
  }
};

const increment = (id) => {
  let selectedItem = id;
  let search = basket.find((items) => items.id === selectedItem.id);

  if (search === undefined) {
    basket.push({
      id: selectedItem.id,
      item: 1,
    });
  } else {
    search.item++;
  }

  //   console.log(basket);
  update(selectedItem.id);
  localStorage.setItem("data", JSON.stringify(basket));
  displayCartItems();
};

const decrement = (id) => {
  let selectedItem = id;
  let addToCart =
    selectedItem.parentElement.parentElement.querySelector("button");
  let search = basket.find((items) => items.id === selectedItem.id);

  if (search === undefined) {
    return;
  } else if (search.item <= 1) {
    updateCartBtn(addToCart);
    search.item = 0;
  } else {
    search.item--;
  }

  //   console.log(basket);
  update(selectedItem.id);
  basket = basket.filter((x) => x.item !== 0);
  localStorage.setItem("data", JSON.stringify(basket));
  displayCartItems();
};

const update = (id) => {
  let search = basket.find((x) => x.id === id);

  document.getElementById(id).innerHTML = search.item;
  calcCartItemsNo();
  getTotal();
  updateCheckout();
};

const calcCartItemsNo = () => {
  const cartItemsNo = document.getElementById("cartItemsNo");

  let total = basket.map((x) => x.item).reduce((x, y) => x + y, 0);
  cartItemsNo.innerHTML = total;
};

// calculate number of items on cart onload
calcCartItemsNo();

// cart display section
const cartItemsDisplay = document.getElementById("cart-items");

const displayCartItems = () => {
  if (basket.length !== 0) {
    let displayCartList = basket.map((x) => {
      let { id, item } = x;
      let cartItem = productsArray.find((y) => y.id === id) || [];
      let sum = cartItem.price * item;

      return /*HTML*/ `
      <li class="min-w-60 flex items-center gap-6 justify-between py-4 border-b border-slate-200">
        <div class="space-y-[0.15rem]">
          <h3 onclick="document.location = '#${id}'" class="font-semibold text-rose900 cursor-pointer">${cartItem.name}</h3>
          <p class="space-x-5">
            <span class="text-red font-medium">${item}x</span> 
            <span class="text-rose500 text-lg font-normal">@ $${cartItem.price}</span>
            <span class="text-rose500 text-lg font-medium">$${sum}</span>
          </p>
        </div>
        <ion-icon name="close-outline" onclick="removeItem(${id})" class="text-red cursor-pointer border border-red rounded-full"></ion-icon>
      </li>
      `;
    });

    displayCartList = displayCartList.join("");
    cartItemsDisplay.innerHTML = displayCartList;
  } else {
    cartItemsDisplay.innerHTML = ``;
  }
};

window.addEventListener("load", () => {
  setTimeout(() => {
    displayCartItems();
    updateCheckout();

    const buttons = document.querySelectorAll(".cart-btn");

    const condition = (item) =>
      item.nextElementSibling.querySelector("span").innerHTML >= 1;

    const selectedItems = Array.from(buttons).filter(condition);

    if (selectedItems) {
      selectedItems.map((selected) => {
        updateBtnsOnLoad(selected);
      });
    }
  }, 50);
});

const updateBtnsOnLoad = (btn) => {
  let quantityReg = btn.nextElementSibling;
  // let productId = quantityReg.querySelector("span");
  let parentElem = btn.parentElement;
  let productImg = parentElem.parentElement.querySelector("picture img");

  // remove border from btn
  parentElem.classList.remove("border");
  // add border to product image
  productImg.classList.add("border-2");
  productImg.classList.add("border-red");
  // hide add-to-cart btn
  btn.classList.remove("flex");
  btn.classList.add("hidden");
  // display quantity regulator
  quantityReg.classList.remove("hidden");
  quantityReg.classList.add("flex");
};

const removeItem = (id) => {
  let selected = id;
  let selectedItem = basket.find((x) => x.id === selected.id);

  while (selectedItem.item > 0) {
    decrement(selected);
  }
  localStorage.setItem("data", JSON.stringify(basket));
  showCheckout();
};

const getTotal = () => {
  if (basket.length !== 0) {
    let amount = basket
      .map((x) => {
        let { id, item } = x;
        let cartItem = productsArray.find((y) => y.id === id) || [];
        return item * cartItem.price;
      })
      .reduce((x, y) => x + y, 0);

    return amount;
  } else {
    return;
  }
};

const updateCheckout = () => {
  const checkout = document.getElementById("checkout");
  const totalDisplay = document.querySelectorAll("[data-total]");

  totalDisplay.forEach((totalD) => (totalD.innerHTML = `$${getTotal()}`));

  if (getTotal() > 0) {
    checkout.classList.remove("hidden");
    checkout.classList.add("block");
  } else {
    checkout.classList.add("hidden");
    checkout.classList.remove("block");
  }
};

// handling modal section
const modal = document.querySelector("dialog");
const purchasedItemsDisplay = document.getElementById("purchased");

const openModal = () => {
  modal.showModal();
  displayPurchasedItems();
};

const reset = () => {
  basket = [];
  localStorage.setItem("data", JSON.stringify(basket));
  window.location.reload();
  modal.close();
};

const displayPurchasedItems = () => {
  if (basket.length !== 0) {
    let purchasedItems = basket.map((x) => {
      let { item, id } = x;
      let items = productsArray.find((y) => y.id === id) || [];
      let sum = items.price * item;

      return /*html*/ `
        <li class="flex justify-between items-center gap-8 border-b border-slate-300 w-full py-4">
          <div class="flex items-center gap-3">
            <img src="${items.image.thumbnail}" alt="" class="size-16 rounded-md object-cover">

            <div class="flex flex-col justify-between min-h-14">
              <h3 class="font-semibold leading-5">${items.name}</h3>
              <p class="space-x-3">
                <span class="text-red font-medium">${item}x</span> 
                <span class="text-rose500 font-normal">@ $${items.price}</span>
              </p>
            </div>
          </div>

          <p class="text-xl font-semibold max-[340px]:hidden">$${sum}</p>
        </li>
      `;
    });

    purchasedItems = purchasedItems.join("");
    purchasedItemsDisplay.innerHTML = purchasedItems;
  } else {
    purchasedItemsDisplay.innerHTML = ``;
  }
};
