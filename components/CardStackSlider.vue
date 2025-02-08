<template>
  <div class="card-stack-slider">
    <div class="card-stack" :style="{ transform: `translateX(${translateX}px)` }">
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="card"
        :class="{ 'active': index === activeIndex }"
        :style="{
          zIndex: cards.length - index,
          transform: `translateX(${getCardPosition(index)}px) scale(${getCardScale(index)})`,
          opacity: getCardOpacity(index)
        }"
      >
        <img :src="card.image" :alt="card.title" class="card-image">
        <div class="card-content">
          <h3>{{ card.title }}</h3>
          <p>{{ card.description }}</p>
          <a :href="card.link" class="card-button">Learn More</a>
        </div>
      </div>
    </div>
    <div class="controls">
      <button @click="prevCard" :disabled="activeIndex === 0">
        <span class="material-icons">chevron_left</span>
      </button>
      <button @click="nextCard" :disabled="activeIndex === cards.length - 1">
        <span class="material-icons">chevron_right</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cards: [
        {
          title: 'Explore Nature',
          description: 'Discover the beauty and tranquility of the natural world.  Escape the everyday and immerse yourself in stunning landscapes.',
          image: 'https://images.unsplash.com/photo-1469474968028-33efcc7ef4b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
          link: '#' // Replace with your actual link
        },
        {
          title: 'Urban Adventures',
          description: 'Experience the vibrant energy of city life.  Explore hidden gems, savor diverse cuisine, and embrace the urban pulse.',
          image: 'https://images.unsplash.com/photo-1501594907352-045c2f6f1064?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
          link: '#' // Replace with your actual link
        },
        {
          title: 'Cultural Immersion',
          description: 'Delve into rich cultures and traditions.  Connect with local communities, learn new perspectives, and create lasting memories.',
          image: 'https://images.unsplash.com/photo-1556103262-29d9cb81e9b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
          link: '#' // Replace with your actual link
        },
        {
          title: 'Delicious Food Tours',
          description: 'Embark on a culinary journey to discover the best local flavors.  Indulge in authentic dishes, meet passionate chefs, and tantalize your taste buds.',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599e7e6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
          link: '#' // Replace with your actual link
        },
        {
          title: 'Relaxing Beach Vacations',
          description: 'Unwind on pristine beaches and soak up the sun.  Enjoy crystal-clear waters, gentle breezes, and the ultimate in relaxation.',
          image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          link: '#' // Replace with your actual link
        }
      ],
      activeIndex: 0,
      translateX: 0,
      cardWidth: 320,
      cardSpacing: 20
    };
  },
  computed: {
    getCardPosition() {
      return (index) => {
        const difference = index - this.activeIndex;
        return difference * this.cardSpacing;
      };
    },

    getCardScale() {
      return (index) => {
        const difference = Math.abs(index - this.activeIndex);
        return Math.max(1 - difference * 0.1, 0.75);
      };
    },

    getCardOpacity() {
      return (index) => {
        const difference = Math.abs(index - this.activeIndex);
        return Math.max(1 - difference * 0.3, 0.3);
      };
    }
  },
  methods: {
    nextCard() {
      if (this.activeIndex < this.cards.length - 1) {
        this.activeIndex++;
        this.updateTranslateX();
      }
    },
    prevCard() {
      if (this.activeIndex > 0) {
        this.activeIndex--;
        this.updateTranslateX();
      }
    },
    updateTranslateX() {
      this.translateX = -this.activeIndex * (this.cardWidth + this.cardSpacing);
    }
  },
  mounted() {}
};
</script>

<style scoped>

/* Import material icons (or use your preferred icon library) */
/* Install material-icons: npm install material-icons */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.card-stack-slider {
  overflow: hidden;
  position: relative;
  width: 100%;
  max-width: 800px; /* Limit width for larger screens */
  margin: 0 auto; /* Center the slider */
}

.card-stack {
  display: flex;
  transition: transform 0.5s ease-in-out;
  padding-bottom: 30px;
}

.card {
  width: 320px;
  height: 480px; /* Slightly taller cards */
  border-radius: 12px; /* More rounded corners */
  background-color: #fff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* Softer shadow */
  transition: all 0.3s ease-in-out;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #eee; /* Light border */
}

.card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card-image {
  width: 100%;
  height: 250px; /* Larger image area */
  object-fit: cover;
}

.card-content {
  padding: 20px;
}

.card h3 {
  margin-top: 0;
  font-size: 1.4em;
  font-weight: 600; /* Semi-bold */
  color: #333; /* Darker text */
}

.card p {
  font-size: 0.95em;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
}

.card-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff; /* Primary color */
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;
}

.card-button:hover {
  background-color: #0056b3; /* Darker shade on hover */
}

.controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  padding: 0 15px;
}

.controls button {
  background-color: rgba(255, 255, 255, 0.9); /* Slightly more opaque */
  border: none;
  border-radius: 50%;
  width: 45px; /* Slightly larger buttons */
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.6em;
  color: #555;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15); /* Softer shadow */
  transition: background-color 0.2s ease-in-out;
}

.controls button:hover {
  background-color: rgba(255, 255, 255, 1);
}

.controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.card.active {
  /* You might want to add some specific styling for the active card, like a brighter border or shadow */
  /* box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4); */
}

</style>
