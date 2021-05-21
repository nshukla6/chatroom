const name = prompt("Enter the name");
const socket = io("http://localhost:9000", {
  query: {
    name
  }
}); // The namespace "/" endpoint
// const socket2 = io("http://localhost:9000/wiki"); // The "/wiki" namespace
// const socket3 = io("http://localhost:9000/mozilla"); // The "/mozilla" namespace
// const socket4 = io("http://localhost:9000/linux"); // The "/linux" namespace

let nsSocket;

// listen for nList, which is the list of all NS
socket.on("nsList", ns => {
  const namespaces = document.querySelector(".namespaces");
  ns.forEach(n => {
    const div = createDiv("namespace", n.endpoint);
    const img = createImage(n.img);
    div.appendChild(img);
    namespaces.appendChild(div);
  });
  
  joinNS("/wiki");

document.querySelectorAll(".namespace").forEach(el => {
    el.addEventListener('click', (evnt) => {
      const namespace = el.getAttribute('ns');
      console.log(namespace);
      joinNS(namespace);
    })
  });
});

function createDiv(className, ns){
  const div = document.createElement("div");
  div.className = className;
  div.setAttribute('ns', ns);
  return div;
}

function createImage(src){
  const img = document.createElement("img");
  img.setAttribute("src",src);
  img.alt = "namespace";
  return img;
}

