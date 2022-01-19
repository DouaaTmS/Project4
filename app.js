const nav = document.querySelector(".nav-list");
const openNav = document.querySelector("nav .ri-menu-line");
const closeNav = document.querySelector("nav .ri-close-line");

const toggleNav = () => {
    nav.classList.toggle("show");
}

openNav.addEventListener("click",toggleNav);
closeNav.addEventListener("click",toggleNav);


/*------------- Hero -----------*/
const heroDOM = document.querySelectorAll(".hero article");
const heroArrowRight = document.querySelector(".hero-arrows .ri-arrow-right-s-line");
const heroArrowLeft = document.querySelector(".hero-arrows .ri-arrow-left-s-line");
let i = 0;


const changeHero = () => {
    const animateOptions = {
        delay: 400,
        duration: 500
    }

    heroDOM.forEach(hero=>{
        hero.classList.remove("active");
    })

    if(i>heroDOM.length-1){
        i=0;
    }
    else if (i<0) {
        i = heroDOM.length-1;

    }

    heroDOM[i].classList.add("active");

    // Animation

    heroDOM[i].animate(
        [
            { opacity: 0 },
            {   opacity: 1 }
        ],
        {
            delay: 0,
            duration: 500
        }
    )

    heroDOM[i].querySelector("h1").animate(
        [
            { transform: `rotate(90deg)` },
            { transform: 'rotate(0)' }
        ],
        animateOptions
    )
    heroDOM[i].querySelector("span").animate(
        [
            { transform: `translateY(100px)` },
            { transform: 'translateY(0)' }
        ],
        animateOptions
    )

    heroDOM[i].querySelector("a").animate(
        [
            { transform: `scale(0)` },
            { transform: 'scale(1)' }
        ],
        animateOptions
    )

}

if(heroArrowLeft) {
    heroArrowLeft.addEventListener("click",()=>{
        i = i+1;
        changeHero(i);
    })
    
    heroArrowRight.addEventListener("click",()=>{
        i= i-1;
        changeHero(i);
    })
}


/*------------ Cart Open -------------*/

const cartDOM = document.querySelector(".cart");
const cartClose = document.querySelector(".cart-overlay .ri-close-line ");
const cartOpen = document.querySelector(".ri-shopping-bag-3-line");

cartOpen.addEventListener("click",()=>{
    cartDOM.classList.add("show");
})

cartClose.addEventListener("click",()=>{
    cartDOM.classList.remove("show");
})


// CART FUNCTIONALITY
const cartItemsDOM = document.querySelector(".cart-items");
const productsDOM = document.querySelector(".products-grid"); 
const cartItemsTotal = document.querySelector(".items-num");
const CartTotalPrice = document.querySelector(".items-price");
const removeAllItemsDOM = document.querySelector(".remove-items");
const featuredDOM = document.querySelector(".featured-grid");
const filterBtns = document.querySelectorAll(".filter-btn");

console.log(featuredDOM);

let buttonsDOM = [];
let cart = [];
let displayProductDOM = [];


class Products {
    // get Products
    async getProducts() {
        let data = await fetch("products.json");
        let result = await data.json();
        let products = await result.items.map(product=>{
            const {id} = product.sys;
            const featured = product.featured;
            const {title,price,image,category} = product.fields;
            return {id,featured,title,price,image,category,amount:1};
        })
        return products;
    }
}

class UI {

    SaveCart () {
        let storageCart = Storage.getCart();
        cart = storageCart;
        this.displayCart(cart);
        this.setCartValues(cart);
        this.cartLogic();
        cart.forEach(cartItem=>{
            let id = cartItem.id;
            let btnDOM= buttonsDOM.find(btn=>btn.dataset.id == id);
            if(btnDOM){
            btnDOM.disabled = true;
            btnDOM.innerHTML= "In Cart";
            }
        })
    }

    displayProducts(products) {
        let result = `` ;
        let featuredResult = ``;
        products.forEach(product=>{
            result +=`
            <div class="product">
            <img src=${product.image} alt="">
            <button data-id=${product.id} class="product-btn button black-btn ">Add To Cart</button>
            <article class="product-info">
                <h4 class="product-title">${product.title}</h4>
                <span class="product-price">$${product.price}</span>
            </article>
        </div>
            `;

        if(product.featured && featuredDOM ) {
            featuredResult += `
                <div class="product">
                <img src=${product.image} alt="">
                <button data-id=${product.id} class="product-btn button black-btn ">Add To Cart</button>
                <article class="product-info">
                    <h4 class="product-title">${product.title}</h4>
                    <span class="product-price">$${product.price}</span>
                </article>
            </div>
            `
        }
        })
        if(productsDOM) {
            productsDOM.innerHTML = result;
        }
        if (featuredDOM) {
            featuredDOM.innerHTML = featuredResult;
        }



    }
    getButtons() {
        let buttons = [...document.querySelectorAll(".product-btn")];
        buttonsDOM = buttons;

        buttons.forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                let id = e.target.dataset.id;
                let inCart = cart.find(cartItem => cartItem.id === id);
                if(inCart) {
                    btn.disabled = true;
                    btn.innerHTML= "InCart";
                    btn.classList.remove("black-btn");
                    btn.classList.add("white-btn");
                }
                else {
                    btn.disabled = true;
                    btn.innerHTML= "InCart";
                    // get CartItem
                    let cartItem = Storage.StorageGetProduct(id);
                    // Set cart storage
                    cart = [...cart,{...cartItem}]
                    Storage.setCart(cart);
                    // set Cart Values
                    this.setCartValues(cart)
                    // display cart
                    this.displayCart(cart)
                    this.showCart();
                    // cartLogic
                    this.cartLogic();
                    
                }
            })
        })

    }

    displayCart(cart) {

        let result = ``;

        cart.forEach(cartItem=>{
            result +=`
            <div data-id=${cartItem.id} class="cart-item">
            <img src=${cartItem.image} alt="">
            <div class="item-info">
                <div class="flex">
                    <h3 class="item-title">${cartItem.title}</h3>
                    <h5 class="item-price">$${cartItem.price}</h5>
                </div>
                <span class="remove-item" data-id=${cartItem.id}>remove</span>
                <div class="item-count">
                    <i class="add-item ri-arrow-up-s-line"></i>                            
                    <span class="item-amount">${cartItem.amount}</span>
                    <i class="minus-item ri-arrow-down-s-line"></i>
                </div>
            </div>
        </div>
            `;
        })

        cartItemsDOM.innerHTML = result;
        
    }

    showCart() {
        cartDOM.classList.add("show");
    }

    setCartValues(cart) {
        let cartTotal = 0;
        let cartPrice = 0;

        if(!cart) {
            CartTotalPrice.innerHTML = 0;
            cartItemsTotal.innerHTML = 0;
        }

        else {

            cart.map(item=>{
                cartTotal +=  parseInt(item.amount);
                cartPrice +=  item.amount * item.price;

                return item;
            })

            CartTotalPrice.innerHTML = `$${parseFloat(cartPrice).toFixed(2)}`;
            if(cartTotal > 9){
                cartItemsTotal.innerHTML = "+9";
            }
            else {
                cartItemsTotal.innerHTML = cartTotal;
            }
        }
    }

    cartLogic() {
        // remove cart item

        const removeBtns = document.querySelectorAll(".remove-item");

        removeBtns.forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                // removeItem DOM
                let id = e.target.dataset.id;
                let parent = btn.parentElement.parentElement;
                parent.remove();

                // removeItem Cart
                let newCart = cart.filter(cartitem=> cartitem.id != id);
                cart = newCart;
                let btnDOM=buttonsDOM.find(btnDOM=>btnDOM.dataset.id==id);
                btnDOM.innerHTML = "ADD TO CART";
                btnDOM.disabled = false;
                Storage.setCart(cart);
                this.setCartValues(cart);

            })
        })

        // +ItemAmount
        const addItemsArrows = document.querySelectorAll(".add-item");
        addItemsArrows.forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                // Add Item
                let id = btn.parentElement.parentElement.parentElement.dataset.id;
                let itemCount = btn.nextElementSibling;
                // Change Amount DOM
                let newAmount = itemCount.innerHTML = parseInt(itemCount.innerHTML) + 1;
                let cartItem = Storage.getCartItem(id);
                // ADD Item to Cart
                let index = cart.findIndex(cartItem=>cartItem.id == id);
                cart[index].amount = newAmount;
                Storage.setCart(cart);
                //SetValues
                this.setCartValues(cart);

            })
        })

        // -ItemAmount
        const minusItemsArrows = document.querySelectorAll(".minus-item");

        minusItemsArrows.forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                // Add Item
                let id = btn.parentElement.parentElement.parentElement.dataset.id;
                let itemCount = btn.previousElementSibling;
                // Change Amount DOM
                let newAmount = itemCount.innerHTML = parseInt(itemCount.innerHTML) - 1;
                if(newAmount > 0 ){
                let cartItem = Storage.getCartItem(id);
                // ADD Item to Cart
                let index = cart.findIndex(cartItem=>cartItem.id == id);
                cart[index].amount = newAmount;
                }
                else {
                    // Remove ItemDOM
                    let parent = btn.parentElement.parentElement.parentElement;
                    parent.remove();
                    // Button
                    let btnDOM=buttonsDOM.find(btnDOM=>btnDOM.dataset.id==id);
                    btnDOM.innerHTML = "ADD TO CART";
                    btnDOM.disabled = false;

                    // removeItem Cart
                    let newCart = cart.filter(cartitem=> cartitem.id != id);
                    cart = newCart;
                }

                Storage.setCart(cart);
                this.setCartValues(cart);
            })
        })

        // Remove ALL Items
        removeAllItemsDOM.addEventListener("click",()=>{
            cart = [];
            Storage.setCart(cart);
            cartItemsDOM.innerHTML=``;
            this.setCartValues(cart);
            buttonsDOM.forEach(btnDOM=>{
                btnDOM.disabled = false;
                btnDOM.innerHTML = "ADD TO CART";
            })
        })


        
    }

    filetCategory() {
        filterBtns.forEach(btn=>{
            btn.addEventListener("click",(e)=>{
                let btnCategory = e.target.dataset.category;
                let newCart= [];
                if(btnCategory == "all"){
                    newCart = Storage.getProducts();
                }
                else {
                newCart = Storage.getProducts().filter(product=> product.category == btnCategory);
                }
                this.displayProducts(newCart);
                this.getButtons();
            })
        })
    }
}

class Storage {

    static StorageSetProducts(products) {
        localStorage.setItem("products",JSON.stringify(products));
    }

    static getProducts() {
        return JSON.parse(localStorage.getItem("products"));
    }

    static StorageGetProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"))
        
        return products.find(product=> product.id ==id);
        
    }

    static setCart(cart) {
        localStorage.setItem("cart",JSON.stringify(cart));
    }

    static getCart() {
        return JSON.parse(localStorage.getItem("cart"));
    }

    static getCartItem(id) {
        let cartItems = JSON.parse(localStorage.getItem("cart"));

        return cartItems.find(cartItem=>cartItem.id===id);
    }


}

document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI();
    const products = new Products();
    
    products.getProducts().then(products=>{
        ui.displayProducts(products);
        Storage.StorageSetProducts(products);
        return products
    }).then((products)=>{
        ui.getButtons();
        ui.filetCategory();
    }).then(()=>{
        ui.SaveCart();
        ui.cartLogic();
    })

})