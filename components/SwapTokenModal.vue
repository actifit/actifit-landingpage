<!-- Swap Tokens Modal -->
<template>
    <div class="modal fade" id="swapTokenModal" ref="swapTokenModal" tabindex="-1">
        <div class="modal-dialog modalOfSwap" role="document" >
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title">{{ $t('swap_tokens') }}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div class="modal-body">
            <iframe
                id="swapWidgetkeychain"
                title="Swap Tokens with Keychain"
                :src= "swapWidgetUrl"
                allow="clipboard-write"
                width="400"
                height="400"
                style="border: none;"
            />
            </div>
        </div>
        </div>
    </div>
    </template>

<script>

export default{
    props: ['swapWidgetUrl'],
}
</script>


<style>
.modalOfSwap {
	margin-left: auto;
	margin-right: auto;
	width: 450px;
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
</style>