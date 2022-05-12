<template>
    <b-container>
        <b-alert :variant="alertType" :show="showAPIAlert">{{ alertMessage }}</b-alert>
        <div class="ui-portlet-section">
            <div class="portlet-header">
                <span class="portlet-title-icon fa mr-1 fa-key"></span><b>Manage API Key</b>
            </div>
            <div class="portlet-content">
                <div class="ui-form-element section-row">
                    <span class="ui-form-title-text"><b>Current API key:</b></span>
                </div>
                <div class="input-group mb-3">
                    <input
                        v-on:focus="$event.target.select()"
                        ref="clone"
                        readonly="readonly"
                        :value="api_key"
                        class="ui-input"
                        id="api-key"
                        type="text"
                        style="display: inline-block" />
                    <div class="input-group-append">
                        <button class="btn btn-outline-dark" type="button" @click="copyAPIKey">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <span class="ui-form-info form-text text-muted">{{ helpMessage }}</span>
            </div>
        </div>
        <div class="mt-3">
            <button id="submit" type="button" class="btn mr-1 btn-primary" @click="createNewAPIKey">
                <span class="mr-1 fa fa-check"></span>Create a new Key
            </button>
        </div>
    </b-container>
</template>

<script>
import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import axios from "axios";
import { getGalaxyInstance } from "app";
import "vue-multiselect/dist/vue-multiselect.min.css";
Vue.use(BootstrapVue);

export default {
    data() {
        const Galaxy = getGalaxyInstance();
        return {
            userAPIUrl: `${Galaxy.root}api/users/${Galaxy.user.id}/api_key`,
            createNewAPIUrl: `${Galaxy.root}api/users/${Galaxy.user.id}/api_key/inputs`,
            api_key: "",
            showAPIAlert: false,
            alertMessage: "success",
            helpMessage:
                "An API key will allow you to access via web API. Please note that this key acts as an alternate means to access your account and should be treated with the same care as your login password.",
        };
    },
    created() {
        this.getAPIKey();
    },
    methods: {
        getAPIKey() {
            axios
                .get(this.userAPIUrl)
                .then((response) => {
                    this.api_key = response.data;
                })
                .catch((error) => {
                    const message = error.response.data.err_msg;
                    this.showAlert("danger", message || "Failed to load API Key.");
                });
        },
        copyAPIKey() {
            this.$refs.clone.focus();
            document.execCommand("copy");
        },
        createNewAPIKey() {
            axios
                .put(this.createNewAPIUrl)
                .then((response) => {
                    this.api_key = response.data["inputs"][0]["value"];
                    this.alertMessage = response.data["message"];
                    this.showAPIAlert = true;
                    this.helpMessage = response.data["inputs"][0]["help"];
                })
                .catch((error) => {
                    const message = error.response.data.err_msg;
                    this.showAlert("danger", message || "Failed to create new API Key.");
                });
        },
        showAlert(type, message) {
            this.showAPIAlert = true;
            this.alertType = type;
            this.alertMessage = message;
        },
    },
};
</script>

<style scoped>
.fa-trash-o {
    color: initial;
}
</style>
