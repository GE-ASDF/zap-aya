const socket = io();
Array.from(document.querySelectorAll(".btn-close")).forEach(btnClose =>{
    btnClose.addEventListener("click", (e)=>{
        e.target.parentNode.remove();
    })
})

    const updateUserList = (users) => {
        const mensagem = document.querySelector(".mensagem")
        mensagem.innerHTML = '';
        users.forEach((user) => {
            const alert = document.createElement("div");
            const message = document.createElement("div");
            const close = document.createElement("div");
            alert.classList.add("alert")
            alert.classList.add("alert-success")
            console.log(user)
            message.textContent = `Há uma nova mensagem!`
            close.classList.add("btn")
            close.classList.add("btn-danger")
            close.classList.add("close")
            close.textContent = "X"
            alert.appendChild(message)
            alert.appendChild(close)
            mensagem.append(alert);
        });
      };
    
      // Receber a lista de usuários atualizada do servidor
      socket.on('new-message', (chats) => {
        updateUserList(chats);
        $("#table-all-chats").load(" #table-all-chats")
        Array.from(document.querySelectorAll(".close")).forEach((i)=>{
            i.addEventListener("click", (e)=>{
               e.target.parentNode.remove()
            })
        })
        setTimeout(() => {
        Array.from(document.querySelectorAll(".close")).forEach((i)=>{
            i.parentNode.remove()
        })
      }, 1000 * 60);
      });
      socket.on("img", ()=>{
          document.querySelector("#title-wait").innerText = "Aguarde o QRCODE";
          document.querySelector("#result").setAttribute("src", "/out.png");
      })

      socket.on("conectado", ()=>{
        document.querySelector("#result") ? document.querySelector("#result").remove():"";
        document.querySelector("#title-wait") ? document.querySelector("#title-wait").remove():"";
      })

      socket.on("ola", (chats)=>{
        console.log(chats)
      })
      socket.on("usuario-atendido", (name)=>{
          const mensagem = document.querySelector(".mensagem")
          mensagem.innerHTML = '';
          const alert = document.createElement("div");
            const message = document.createElement("div");
            const close = document.createElement("div");
            alert.classList.add("alert")
            alert.classList.add("alert-primary")
            message.textContent = `O usuário ${name} está sendo atendido.`
            close.classList.add("btn")
            close.classList.add("btn-danger")
            close.classList.add("close")
            close.textContent = "X"
            alert.appendChild(message)
            alert.appendChild(close)
            mensagem.append(alert);
      })
function mensagemInformacional(){

}