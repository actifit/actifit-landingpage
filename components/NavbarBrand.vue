<template>
  <!-- Brand for navbar on subpages -->
  <div class="navbar-brand py-0 pl-2">
    <img src="/img/actifit_logo.png" alt="Actifit" class="float-left mr-2" />
    <div class="float-left d-none d-sm-block">
      <h1 class="m-0 text-brand text-center">{{ $t('Actifit') }}</h1>
      <h3 class="m-0 font-italic text-brand">{{ $t('Slogan') }}</h3>
    </div>
  </div>
</template>

<style lang="sass">
  .navbar-brand
    img
      width: 40px
    h1
      font-size: 14px
    h3
      font-size: 12px
</style>
