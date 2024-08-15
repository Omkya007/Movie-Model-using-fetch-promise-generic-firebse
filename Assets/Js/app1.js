
const cl = console.log;
const moviecontainer = document.getElementById("moviecontainer");
const backdrop = document.getElementById("backdrop");
const movieModel = document.getElementById("movieModel");
const addmoviebtn = document.getElementById("addmoviebtn");
const movieClose = [...document.querySelectorAll(".movieClose")];
const movieform = document.getElementById("movieform");
const titleControls = document.getElementById("title");
const movieurlControls = document.getElementById("movieurl");
const contentControls = document.getElementById("content");
const ratingControls = document.getElementById("movierating");
const submitbtn = document.getElementById("submitbtn");
const updatebtn = document.getElementById("updatebtn");
const loader = document.getElementById("loader");

 


const BASE_URL = `https://movie-model-ad58e-default-rtdb.asia-southeast1.firebasedatabase.app/`

const MOVIE_URL = `${BASE_URL}/movie.json`

let movieArr = [];

const sweetalert = (msg, iconstr)=>{
    swal.fire({
        title:msg,
        timer:2000,
        icon:iconstr
    })  
}



const toggleModalBackdrop = () => {
  backdrop.classList.toggle(`visible`);
  movieModel.classList.toggle(`visible`);
  updatebtn.classList.add(`d-none`);
  submitbtn.classList.remove(`d-none`);

  movieform.reset();
};

movieClose.forEach((btn) => {
  btn.addEventListener("click", toggleModalBackdrop);
});



const createMovieCards = (arr) => {
  moviecontainer.innerHTML = arr.map(movie=> {

    return `<div class="col-md-4 mb-4 mb-md-0">
                   <div class="card mb-4 movieCard" id="${movie.id}">                   
                        <figure class="m-0">
                            <img src=${movie.movieurl} alt="">
                        
                            <figcaption>
                               <div class="figcapinfo">
                                <h3>${movie.title}</h3>
                                <strong>Rating:${movie.movierating}/5</strong>
                                <p>
                                ${movie.content}
                                </p>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <button class="btn btn-sm btn-primary" onclick="onMovieEdit(this)">
                                     Edit
                                    </button>
                                    <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">
                                      Remove
                                    </button>
                                 </div>
                            </figcaption> 
                            
                        
                        </figure>
                                                                  
                        </div>
                    </div>`

  }).join("");

};



const makeApiCall = (method, url, msgbody) => {
    loader.classList.remove('d-none');
    msgbody = msgbody ? JSON.stringify(msgbody) : null;
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: method,
            body: msgbody,
            headers: {
                token:`Get token from LS`
            }
        })
        .then(response => {
           
            return response.json();
        })
        .then(data => resolve(data))
        .catch(error => reject(error))
        .finally(() => {
            loader.classList.add('d-none');
        });
    });
};




//GET data from Backend
const fetchMovies = () => {
    makeApiCall("GET", MOVIE_URL)
        .then(movieObj => {
            let movieArr = [];
            for (const key in movieObj) {
                movieArr.push({ ...movieObj[key], id: key });
            }
            createMovieCards(movieArr);
        })
        .catch(err => sweetalert(`Error: ${err.message}`, 'error'));
};




  fetchMovies();



  const onAddMovie = (eve) => {
    eve.preventDefault();
    let newMovieObj = {
        title: titleControls.value,
        movieurl: movieurlControls.value,
        content: contentControls.value,
        movierating: ratingControls.value
    };

    makeApiCall("POST", MOVIE_URL, newMovieObj)
        .then(res => {
            newMovieObj.id = res.name;
            let div = document.createElement("div");
            div.className = 'col-md-4 mb-4 mb-md-0';
            div.innerHTML = `
                <div class="card mb-4 movieCard" id="${newMovieObj.id}">
                    <figure class="m-0">
                        <img src=${newMovieObj.movieurl} alt="">
                        <figcaption>
                            <div class="figcapinfo">
                                <h3>${newMovieObj.title}</h3>
                                <strong>Rating:${newMovieObj.movierating}/5</strong>
                                <p>${newMovieObj.content}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <button class="btn btn-sm btn-primary" onclick="onMovieEdit(this)">Edit</button>
                                <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">Remove</button>
                            </div>
                        </figcaption>
                    </figure>
                </div>`;
            moviecontainer.append(div);
            sweetalert(`${newMovieObj.title} is added successfully`, "success");
        })
        .catch(err => sweetalert(`Error: ${err.message}`, 'error'))
        .finally(() => {
            toggleModalBackdrop();
            movieform.reset();
        });
};

  
 

const onMovieEdit = (ele) => {
    toggleModalBackdrop();
    let editId = ele.closest('.card').id;
    localStorage.setItem("editId", editId);
    let EDIT_URL = `${BASE_URL}/movie/${editId}.json`;

    makeApiCall("GET", EDIT_URL)
        .then(res => {
            titleControls.value = res.title;
            movieurlControls.value = res.movieurl;
            contentControls.value = res.content;
            ratingControls.value = res.movierating;
        })
        .catch(err => sweetalert(`Error: ${err.message}`, 'error'))
        .finally(() => {
            updatebtn.classList.remove('d-none');
            submitbtn.classList.add('d-none');
        });
};


const onUpdateMovie = () => {
  let updateId = localStorage.getItem("editId");
  let UPDATE_URL = `${BASE_URL}/movie/${updateId}.json`;
  let updatedObj = {
      title: titleControls.value,
      movieurl: movieurlControls.value,
      content: contentControls.value,
      movierating: ratingControls.value
  };

  makeApiCall("PATCH", UPDATE_URL, updatedObj)
      .then(res => {
          let card = document.getElementById(updateId);
          card.innerHTML = `
              <figure class="m-0">
                  <img src=${updatedObj.movieurl} alt="">
                  <figcaption>
                      <div class="figcapinfo">
                          <h3>${updatedObj.title}</h3>
                          <strong>Rating:${updatedObj.movierating}/5</strong>
                          <p>${updatedObj.content}</p>
                      </div>
                      <div class="d-flex justify-content-between">
                          <button class="btn btn-sm btn-primary" onclick="onMovieEdit(this)">Edit</button>
                          <button class="btn btn-sm nfx-btn text-white" onclick="onMovieRemove(this)">Remove</button>
                      </div>
                  </figcaption>
              </figure>`;
          sweetalert(`${updatedObj.title} is updated successfully`, "success");
      })
      .catch(err => sweetalert(`Error: ${err.message}`, 'error'))
      .finally(() => {
          toggleModalBackdrop();
          movieform.reset();
          updatebtn.classList.add('d-none');
          submitbtn.classList.remove('d-none');
      });
};

    
  
  
const onMovieRemove = (ele) => {
  let removeId = ele.closest('.card').id;

  Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
  }).then((result) => {
      if (result.isConfirmed) {
          let REMOVE_URL = `${BASE_URL}/movie/${removeId}.json`;

          makeApiCall("DELETE", REMOVE_URL)
              .then(res => {
                  document.getElementById(removeId).remove();
                  Swal.fire('Deleted!', 'Your movie has been deleted.', 'success');
              })
              .catch(err => sweetalert(`Error: ${err.message}`, 'error'));
      }
  });
};

  

 









  movieform.addEventListener("submit", onAddMovie);
  addmoviebtn.addEventListener("click", toggleModalBackdrop);
  updatebtn.addEventListener("click", onUpdateMovie);
