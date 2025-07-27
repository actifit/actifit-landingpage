// file: middleware/auth-wallet.js

export default function ({ store, redirect, app }) {
  // Check if the user is not logged in by looking at the Vuex store
  if (!store.state.steemconnect.user) {
    // If not logged in, redirect to the localized homepage.
    return redirect(app.localePath('/'));
  }
}