<template>
  <div>
    <vue-remarkable :source="source" :options="options" ref="remarkable"></vue-remarkable>

    <!-- External Link Modal -->
    <div class="modal fade" id="externalLinkModal" tabindex="-1" role="dialog" aria-labelledby="externalLinkModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="externalLinkModalLabel">{{ $t('external_link_warning') || 'External Link Warning' }}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>{{ $t('external_link_message') || 'You are about to visit an external website:' }}</p>
            <p style="word-break: break-all;"><strong>{{ externalLinkUrl }}</strong></p>
            <p>{{ $t('continue_to_external') || 'Do you want to continue?' }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="closeModal">{{ $t('cancel') || 'Cancel' }}</button>
            <button type="button" class="btn btn-primary" @click="openExternalLink">{{ $t('continue') || 'Continue' }}</button>
          </div>
          </div>
          </div>
          </div>
          </div>
          </template>

          <script>
          import vueRemarkable from 'vue-remarkable';

          export default {
          name: 'SafeRemarkable',
          components: {
          vueRemarkable
          },
          props: {
          source: { type: String, required: true },
          options: { type: Object, default: () => ({ html: true, breaks: true, typographer: true }) }
          },
          data() {
          return {
          externalLinkUrl: ''
          };
          },
          mounted() {
          this.addLinkListeners();
          },
          updated() {
          this.addLinkListeners();
          },
          methods: {
          addLinkListeners() {
          const el = this.$el;
          if (!el) return;
          // Use a small timeout to ensure Remarkable has rendered the content
          setTimeout(() => {
          const links = el.querySelectorAll('a.external-link');
          links.forEach(link => {
          link.removeEventListener('click', this.handleLinkClick);
          link.addEventListener('click', this.handleLinkClick);
          });
          }, 100);
          },
          handleLinkClick(event) {
          const anchor = event.currentTarget; 
          event.preventDefault();
          event.stopPropagation();

          this.externalLinkUrl = anchor.getAttribute('data-external-href');

          const modalEl = document.getElementById('externalLinkModal');
          if (modalEl && typeof window.jQuery !== 'undefined') {
          // Append to body to avoid stacking context issues (makes buttons clickable)
          document.body.appendChild(modalEl);
          window.jQuery(modalEl).modal('show');
          }
          },
          closeModal() {
          const modalEl = document.getElementById('externalLinkModal');
          if (modalEl && typeof window.jQuery !== 'undefined') {
          window.jQuery(modalEl).modal('hide');
          }
          },
          openExternalLink() {
          if (this.externalLinkUrl) {
          window.open(this.externalLinkUrl, '_blank');
          }
          this.closeModal();
          }
          },
          beforeDestroy() {
          // Cleanup if modal was moved to body
          const modalEl = document.getElementById('externalLinkModal');
          if (modalEl && modalEl.parentNode === document.body) {
          document.body.removeChild(modalEl);
          }
          }
          };
          </script>

          <style scoped>
          .modal {
          background: rgba(0,0,0,0.5);
          }
          /* Ensure the modal is above everything when shown */
          #externalLinkModal {
          z-index: 10050 !important;
          }
          </style>