const cartBtn=document.querySelector(".cart-btn");
const closecartBtn=document.querySelector(".close-item");
const clearcartBtn=document.querySelector(".clear-cart");
const cartDOM=document.querySelector(".cart");
const cartOverlay=document.querySelector(".cart-overlay");
const cartItems=document.querySelector(".cart-item");
const cartTotal=document.querySelector(".cart-total");
const cartContent=document.querySelector(".cart-content");
const productDOM=document.querySelector(".product-center");


let cart=[];
let buttonDom=[];

 
//Geting the product
class Products{
    async getProducts(){
        try {
           let result=await fetch("products.json");
           let data=await result.json();
          let products=data.items;
          products=products.map(item =>{
              const {title,price}=item.fields;
              const {id}=item.sys;
              const image=item.fields.image.fields.file.url;
              return{title,price,id,image}
          })
          return products;
        } catch (error) {
            console.log(error);
        }
    }
}

//Display the product
class UI{
    displasyProducts(products){
            let result='';
            products.forEach(product => {
                result+=`<artical class="product">
                <div class="img-container">
                    <img src=${product.image} alt="" class="product-img">
                    <button class="product-btn" data-id=${product.id}><i class="fas fa-shopping-cart"></i>
                    add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
            </artical>`;

            
            });
            productDOM.innerHTML=result;
    }
    getBagbottons(){
        const buttons=[...document.querySelectorAll('.product-btn')];
        buttonDom=buttons;
        buttons.forEach(button=>{
            let id=button.dataset.id;
            let inCart=cart.find(item=>item.id===id);
            if(inCart){
                button.innerText="In cart";
                button.disabled=true;
            }
            else
                button.addEventListener('click',(event)=>{
                    event.target.innerText="In Cart";
                    event.target.disabled=true;


                    //Get products from product

                    let cartItem={...Storage.getProducts(id),amount:1}
                    //add product to the cart

                    cart=[...cart,cartItem];

                    //Save Cart in local Storage
                    Storage.saveCart(cart);

                    //Set Cart Value

                    this.setCartValue(cart);

                    //Add cartItem

                    this.addCartItem(cartItem);

                    //Show Cart
                    this.showCart();
                })
            
        });
    }

    setCartValue(cart){
        let tempTotal=0;
        let itemTotal=0;
        cart.map(item=>{
            tempTotal +=item.price*item.amount;
            itemTotal +=item.amount;
        });
        cartTotal.innerText=parseFloat(tempTotal.toFixed(2));
        cartItems.innerText=itemTotal;
        console.log(tempTotal,itemTotal);
    }

    addCartItem(item){
        const div=document.createElement('div');
        div.classList.add('cart-items');
        div.innerHTML=`<img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>

        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);
        console.log(cartContent);
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP(){
        cart=Storage.getCart();
        this.setCartValue(cart);
        this.populate(cart);
        cartBtn.addEventListener('click',this.showCart);
        closecartBtn.addEventListener('click',this.hidecart);
    }

    populate(cart){
        cart.forEach(item=>this.addCartItem(item));
    }
    hidecart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        //Clear Cart
        clearcartBtn.addEventListener('click',()=>{
            this.clearCart();
        });
        //Cart Functionality
        cartContent.addEventListener('click',event=>{
            if(event.target.classList.contains("remove-item")){
                let removeItem=event.target;
                let id=removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(event.target.classList.contains("fa-chevron-up")){
                var addAmount=event.target;
                var id=addAmount.dataset.id;
                let tempItem=cart.find(item=>item.id===id);
                tempItem.amount=tempItem.amount+1;
                Storage.saveCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerText= tempItem.amount;
            }
            else if(event.target.classList.contains("fa-chevron-down")){
                var lowerAmount=event.target;
                var id=lowerAmount.dataset.id;
                let tempItem=cart.find(item=>item.id===id);
                tempItem.amount=tempItem.amount-1;
                if(tempItem.amount>0){
                    Storage.saveCart(cart);
                    this.setCartValue(cart);
                    lowerAmount.previousElementSibling.innerText= tempItem.amount;
                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
               
            }
        })
    }
    clearCart(){
        let cartItems=cart.map(item=>item.id);
       cartItems.forEach(id=>this.removeItem(id));

       
       while(cartContent.children.length>0){
           cartContent.removeChild(cartContent.children[0]);
       }
       this.hidecart();
    }
    removeItem(id){
        cart=cart.filter(item=>item.id !==id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button=this.getSingleButton(id);
        button.disabled=false;
        button.innerHTML=`<i class="fas fa-shopping-cart"</i> Add to Cart`;
    }
    getSingleButton(id){
        return buttonDom.find(button=>button.dataset.id===id)
    }

}

class Storage{

    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProducts(id){
        let products=JSON.parse(localStorage.getItem("products"));
        return products.find(product=>product.id===id);
    }
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];

    }

}


document.addEventListener("DOMContentLoaded",()=>{
    const ui=new UI();
    const products=new Products();
    ui.setupAPP();

    products.getProducts().then(products=>{ui.displasyProducts(products);
        Storage.saveProducts(products);
        
    }).then(()=>{
        ui.getBagbottons();
        ui.cartLogic();
    });
});