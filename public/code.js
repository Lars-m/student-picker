
let currentStudent = {};
let divCurrentStudent = document.getElementById("div-accepted");
let divStatus = document.getElementById("div-status");
let btnAccept = document.getElementById("bnt-accept");
let student = document.getElementById("student");
let interValClear;
let dotCount = 0;

function setUiStatus(showCurrentStudent, showStatusDiv) {
  if (showCurrentStudent && !showStatusDiv) {
    divCurrentStudent.style.display = "block";
    btnAccept.style.display = "block";
    divStatus.style.display = "none";
  }
  else if (!showCurrentStudent && !showStatusDiv) {
    divCurrentStudent.style.display = "none";
    btnAccept.style.display = "none";
    divStatus.style.display = "none";
  }
  else if (showStatusDiv) {
    divCurrentStudent.style.display = "none";
    btnAccept.style.display = "none";
    divStatus.style.display = "block";
  }
}

function presentationStatus() {
  setUiStatus(false, false);
  currentStudent = {};
  const options = {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  fetch("api/presentation-status", options).then(r => r.json())
    .then(result => {
      setUiStatus(false, true)
      document.getElementById("tries").innerHTML = result.tries;
      const rows = result.status.map(n => {
        return `<tr><td>${n.name}</td><td>
          <button type="button" class="btn btn-outline-danger btn-sm" 
                                style="margin-right:2em;font-family:'courier'"> - </button>${n.presentations}
          <button type="button" class="btn btn-outline-success btn-sm" 
                                style="margin-left:2em;;font-family:'courier'"> + </button</td></tr>`;
      })
      document.getElementById("tbody").innerHTML = rows.join("");
    })
}

function clearAllPresentations() {
  setUiStatus(false, false);
  currentStudent = {};
  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  fetch("api/clear-all-presentations", options).then(r => r.json())
    .then(status => {
      setUiStatus(false, false)
      document.getElementById("tbody").innerHTML = "";
    })
}

function incrementAllowedPresentations() {
  setUiStatus(false, false);
  currentStudent = {};
  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  fetch("api/increase-allowed-presentations", options).then(r => r.json())
    .then(status => {
      setUiStatus(false, false)
      document.getElementById("tbody").innerHTML = "";
    })
}

function nextStudent() {
  setUiStatus(false, false)
  currentStudent = {};
  student.style.marginTop = 0;
  const options = {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }


  fetch("api/next-student", options).then(r => r.json())
    .then(d => {
      currentStudent = d;
      student.innerHTML = d.name;
      setUiStatus(true, false)

    })
}
function studentAccepts() {
  let div = document.getElementById("div-accepted");

  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(currentStudent)
  }
  fetch("/api/student-accepted", options).then(r => r.json())
    .then(d => {
      dotCount = 0;
      btnAccept.style.display = "none"
      let marginTop = 0;
      interValClear = setInterval(() => {
        let val = student.innerHTML;
        val = dotCount === 0 ? "&#x2192;  " + val : "&#x2192;" + val;
        student.innerHTML = val;
        marginTop += 10;
        student.style.marginTop = marginTop + "px";
        dotCount++;
        if (dotCount === 10) {
          clearInterval(interValClear);
        }
      }, 50)
    })
}

document.getElementById("btn-next").onclick = nextStudent;
document.getElementById("bnt-accept").onclick = studentAccepts;
document.getElementById("btn-status").onclick = presentationStatus;
document.getElementById("btn-clear-all").onclick = clearAllPresentations;
document.getElementById("btn-inc").onclick = incrementAllowedPresentations;