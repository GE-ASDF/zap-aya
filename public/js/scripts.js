Array.from(document.querySelectorAll(".btn-close")).forEach(btnClose =>{
    btnClose.addEventListener("click", (e)=>{
        e.target.parentNode.remove();
    })
})

const socket = io();
    const updateUserList = (users) => {
        const userList = document.getElementById('user-list');
        const mensagem = document.querySelector(".mensagem")
        userList.innerHTML = '';
        mensagem.innerHTML = '';
        users.forEach((user) => {
            console.log(user)
            const alert = document.createElement("div");
            const message = document.createElement("div");
            const close = document.createElement("div");
            alert.classList.add("alert")
            alert.classList.add("alert-success")
            message.textContent = `Há uma nova mensagem do usuário: ${user.from.replace("@c.us", "")}`
            close.classList.add("btn")
            close.classList.add("btn-danger")
            close.classList.add("close")
            close.textContent = "X"
            alert.appendChild(message)
            alert.appendChild(close)
            mensagem.append(alert);
          const li = document.createElement('li');
          const link = document.createElement("a");
          const link2 = document.createElement("a");
          link.textContent = "Finalizar atendimento";
          link2.textContent = "Atender";
          link.setAttribute("href", `/finalizar-chat/${user.from}`);
          link.classList.add("btn");
          link.classList.add("btn-danger");
          link2.setAttribute("href", `/responder/${user.from}`);
          link2.classList.add("btn");
          link2.classList.add("btn-primary");
          li.textContent = user.from.replace("@c.us","");
          li.appendChild(link);
          li.appendChild(link2);
          userList.append(li);
        });
      };
    
      // Receber a lista de usuários atualizada do servidor
      socket.on('new-message', (users) => {
        updateUserList(users);
        Array.from(document.querySelectorAll(".close")).forEach((i)=>{
            i.addEventListener("click", (e)=>{
                console.log(e.target.parentNode.remove())
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
        document.querySelector("#result").setAttribute("src", "out.png");
      })

      socket.on("conectado", ()=>{
        document.querySelector("#result").remove();
        document.querySelector("#title-wait").remove();
      })