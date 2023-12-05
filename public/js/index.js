function hamburgerButton() {
    let checkbox = document.getElementById("check");
    let sidepanel = document.querySelector(".sidePanel");
    let main = document.querySelector("main");

    if (checkbox.checked) {
      
        sidepanel.style = "transition:.3s; left:-300px;"
        main.style = "transition:.3s; width:100%; left:0px;"
    }else{
        sidepanel.style = " transition:.3s ;left:0px;"
        main.style = " transition:.3s; width: calc(100% - 300px); left:300px;"
        
    }
}



function redirectExamPaperGenerator(){
    window.location.href = "/dashboard/Exam Paper Generator"
}

function redirectDashboard(){
    window.location.href = "/dashboard"
}
function redirectAiQuestionGenerator(){
    window.location.href = "/dashboard/Ai Question Generator"
}

window.onload = function() {
    // Delay in milliseconds
    var delay = 1000;
  
    // Code to be executed when the page and CSS file are fully loaded
    setTimeout(showPage, delay);
  };
  
  function showPage() {
    // Display the page or perform any necessary actions
    document.body.style.visibility = 'visible';
    document.querySelector(".shimmer"). style.visibility = "hidden"
  }
  


  var rippleEffect = (function(){
    var className, ripple;
    
    className = 'btn';
    ripple = document.createElement("div")
    ripple.classList.add('ripple')
    
    document.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains(className)) {
        ripple.setAttribute("style", "top: " + e.offsetY + "px; left: " + e.offsetX + "px");
        e.target.appendChild(ripple)
      }
    })
  })();

 