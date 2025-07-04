<template>
  <span
    class="small text-muted ml-3"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    style="cursor: help;"
  >
    {{ timeAgo }}
    <span
      v-if="tooltipVisible"
      class="date-tooltip"
      :style="{ top: tooltipY + 'px', left: tooltipX + 'px' }"
    >
      {{ fullDate }}
    </span>
  </span>
</template>

<script>
export default {
  name: 'TimeAgo',
  props: {
    timestamp: { type: String, required: true }
  },
  data() {
    return {
      tooltipVisible: false,
      tooltipX: 0,
      tooltipY: 0
    }
  },
  computed: {
    timeAgo() {
      const date = new Date(this.timestamp.endsWith('Z') ? this.timestamp : this.timestamp + 'Z');
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (seconds < 60) return `${seconds} second(s) ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} min(s) ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour(s) ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days} day(s) ago`;
      const weeks = Math.floor(days / 7);
      if (weeks < 52) return `${weeks} week(s) ago`;
      const years = Math.floor(days / 365);
      return `${years} year(s) ago`;
    },
    fullDate() {
      const date = new Date(this.timestamp.endsWith('Z') ? this.timestamp : this.timestamp + 'Z');
      return date.toLocaleString();
    }
  },
  methods: {
    showTooltip(event) {
      this.tooltipVisible = true;
      this.tooltipX = event.clientX + 10;
      this.tooltipY = event.clientY + 10;
    },
    hideTooltip() {
      this.tooltipVisible = false;
    }
  }
}
</script>

<style scoped>
.date-tooltip {
  position: fixed;
  background: #fff;
  color: #222;
  border: 1px solid #ff112d;
  border-radius: 8px;
  padding: 8px 14px;
  z-index: 99999;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  font-size: 1rem;
  pointer-events: none;
  min-width: 120px;
  white-space: nowrap;
}
</style>