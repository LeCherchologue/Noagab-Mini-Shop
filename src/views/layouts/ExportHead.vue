<template>
    <div class="row d-flex justify-content-center align-items-center mb-4">
        <div class="col-3 border-right border-dark">
            <img src="@/assets/logo.png" class="w-100">
        </div>
        <div class=" col-6">
            <div class="text-left" >
                <h2 class="text-primary font-weight-bold" >TRANSPORT <br>LOGISTICS & </h2>
                <span class="font-italic">Yam's votre partenaire logistique innovant</span>
            </div>
        </div>
        <div class="col-3">
            <img src="@/assets/yams-qrcode-links.png" class="w-75">
        </div>
    </div>
    <hr>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ExportHead'
})
</script>