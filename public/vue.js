const APIURI=  'https://protected-sands-01258.herokuapp.com'

let webstore = new Vue({
  el: "#app",
  data: {
    lessons: [],
    sortBy: "topic",
    // sortOrder: "asc",
    activePage: "lessons",
    name: "",
    phone: "",
    targetLesson: null,
    searchTerm: "",
  },
  methods: {
    // this is to change from the product page to payment page or other way round
    togglePage() {
      if (this.activePage === "lessons") {
        this.activePage = "confirm";
      } else {
        this.activePage = "lessons";
      }
    },
    // this will purchase a lesson 
    purchaseLesson(lesson) {
      this.targetLesson = lesson;
      this.togglePage();
    },
    // this will cancel a purchase
    cancelLesson() {
      this.targetLesson = null;
      this.togglePage();
    },
    async confirm() {
      await fetch(`${APIURI}/order`, {
        method: "POST",
        body: JSON.stringify({
          name: this.name,
          phone: this.phone,
          lesson_id: this.targetLesson._id,
          spaces: 1,
        }),
      }).then(async (response) => {
        let data = await response.json();

        await fetch(`${APIURI}/lesson/${this.targetLesson._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            space: 1,
          }),
        }).then(() => {
          Swal.fire({
            title: "Confirmed!",
            text: `${this.name} Thank you. We will contact you at ${this.phone}. ${data.msg}`,
            icon: "success",
            confirmButtonText: "Cool",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        });
      });
    },
    // this will allow the user to serch for lessons
    async search() {
      let response = await fetch(`${APIURI}/search/${this.searchTerm}`, {
        method: "GET", // this will get the lessons from the database from what we searched for
      });
      let data = await response.json();
      this.lessons = data;

      console.log("data: ", data);
    },
    // this will retreive lessons and diplay them
    async getLessons() {
      let response = await fetch(`${APIURI}/lesson`, {
        method: "GET", //this will get the lessons from the database
      });
      let data = await response.json();
      this.lessons = data;
    }
  },
  computed: {
    sortedLessons: function () {
      // if sorting in ascending order
      if (this.sortOrder === "asc") {
        return this.lessons.sort((a, b) =>
          a[this.sortBy] > b[this.sortBy]
            ? 1
            : b[this.sortBy] > a[this.sortBy]
            ? -1
            : 0
        );
      }
      // if sorting in descending order
      return this.lessons.sort((a, b) =>
        a[this.sortBy] > b[this.sortBy]
          ? -1
          : b[this.sortBy] > a[this.sortBy]
          ? 1
          : 0
      );
    },
    canCheckout: function () {
      let isNameCorrect = /^[a-zA-Z\s]*$/.test(this.name); // regex is used to check if name contains letters only
      let isPhoneCorrect = /^[0-9]+$/.test(this.phone) && this.phone.length > 11; // regex is used to check if phone contains number only AND it has more than 11 digits
      return isNameCorrect && isPhoneCorrect;
    },
  },
  mounted() {
    this.getLessons()
  },
  watch: {
    // this will constantly update the search criteria like in google
    searchTerm() {
      if(this.searchTerm) {
        this.search();
      } else {
        this.getLessons();
      }
    },
  },
});
