<template>
  <!-- Rendered once, from layouts/default.vue. Opened via utils/keyPrompt.js. -->
  <!-- @focusin.stop: an open Bootstrap 4 modal moves any focus outside itself back to
       itself (a focusin handler on document). This prompt opens OVER those modals, so
       without this its input could not keep focus. -->
  <div v-if="open" class="key-prompt-backdrop" role="dialog" aria-modal="true"
       :aria-labelledby="'key-prompt-title'" @keydown.esc="cancel" @focusin.stop>
    <div class="key-prompt-card">
      <h5 id="key-prompt-title" class="key-prompt-title">
        {{ request.type === 'active' ? $t('key_prompt_title_active') : $t('key_prompt_title_posting') }}
      </h5>
      <p class="key-prompt-account">@{{ request.account }}</p>

      <!-- What this key is about to sign. Text interpolation only: these lines carry
           user-controlled values (memos, permlinks). -->
      <div v-if="request.summary && request.summary.length" class="key-prompt-ops">
        <p class="key-prompt-ops-label">{{ $t('key_prompt_operation') }}</p>
        <ul>
          <li v-for="(line, i) in request.summary" :key="i">{{ line }}</li>
        </ul>
      </div>

      <!-- type="password" and no autocomplete: this is a private key, not a login
           field a password manager should offer to save. -->
      <input ref="keyInput" v-model="wif" type="password" class="form-control" :disabled="checking"
             autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
             :placeholder="request.type === 'active' ? $t('Private_active_key') : $t('Private_posting_key')"
             @keydown.enter="submit">

      <p v-if="error" class="key-prompt-error" role="alert">{{ error }}</p>

      <p class="key-prompt-note">
        {{ request.type === 'active' ? $t('key_prompt_note_active') : $t('key_prompt_note_posting') }}
      </p>

      <div class="key-prompt-actions">
        <button type="button" class="btn btn-secondary" @click="cancel">{{ $t('Cancel') }}</button>
        <button type="button" class="btn btn-brand" :disabled="checking || !wif" @click="submit">
          {{ $t('key_prompt_sign') }}
          <i v-if="checking" class="fas fa-spin fa-spinner"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { registerKeyPrompt, resolveKeyRequest } from '~/utils/keyPrompt'
import { classifyKey, keyRefusal } from '~/utils/keyChecks'

export default {
  name: 'KeyPromptModal',
  data () {
    return { open: false, request: { type: 'posting', account: '', summary: [] }, wif: '', error: '', checking: false }
  },
  mounted () {
    registerKeyPrompt((req) => {
      this.request = req
      this.wif = ''
      this.error = ''
      this.checking = false
      this.open = true
      this.$nextTick(() => { if (this.$refs.keyInput) this.$refs.keyInput.focus() })
    })
  },
  beforeDestroy () {
    // Never leave a caller waiting on a prompt that no longer exists.
    this.finish(null)
    registerKeyPrompt(null)
  },
  methods: {
    async submit () {
      if (!this.wif || this.checking) return
      const request = this.request
      const wif = this.wif.trim()
      this.checking = true
      this.error = ''
      const kind = await classifyKey(request.account, wif)
      // Cancelled, or replaced by another prompt, while the lookup ran: this answer is
      // not for the prompt now showing.
      if (!this.open || this.request !== request) return
      this.checking = false

      // The same rule the buy-now forms apply (utils/keyChecks.js): refuses an owner key,
      // the wrong role, a key of another account, and - when the account lookup fails -
      // a key we could not check at all.
      const refusal = keyRefusal(kind, this.request.type)
      if (refusal) {
        this.error = this.$t(refusal)
        return
      }
      this.finish(wif)
    },
    cancel () {
      this.finish(null)
    },
    finish (wif) {
      this.open = false
      // Drop our copy before handing it on, so this component never retains it.
      this.wif = ''
      this.error = ''
      resolveKeyRequest(wif)
    }
  }
}
</script>

<style scoped>
.key-prompt-backdrop {
  position: fixed;
  inset: 0;
  /* Above the cookie bar (9999) and the security banner (9998): a signing prompt is
     the one thing that must not be covered. */
  z-index: 10050;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.key-prompt-card {
  background: #fff;
  color: #212529;
  border-radius: 8px;
  max-width: 440px;
  width: 100%;
  padding: 1.25rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}
.key-prompt-title { margin: 0 0 0.25rem; font-weight: 600; }
.key-prompt-account { margin: 0 0 0.75rem; color: #6c757d; }
.key-prompt-error { color: #b02a37; margin: 0.5rem 0 0; font-size: 0.9rem; }
.key-prompt-note { color: #6c757d; font-size: 0.85rem; margin: 0.75rem 0; }
.key-prompt-ops { background: #f5f6f8; border-radius: 6px; padding: 0.5rem 0.75rem; margin: 0 0 0.75rem; }
.key-prompt-ops-label { margin: 0 0 0.25rem; font-size: 0.8rem; color: #6c757d; }
.key-prompt-ops ul { margin: 0; padding-left: 1.1rem; font-size: 0.85rem; word-break: break-all; }
.key-prompt-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>
