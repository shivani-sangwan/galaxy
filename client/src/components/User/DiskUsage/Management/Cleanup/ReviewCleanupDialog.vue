<template>
    <b-modal id="review-cleanup-dialog" title-tag="h2" centered @show="onShowModal" v-model="showDialog" static>
        <template v-slot:modal-title>
            {{ title }}
            <span class="text-primary h3">{{ totalItems }}<span v-if="rowLimitReached">+</span> items</span>
        </template>
        <div>
            {{ captionText }}
            <b>
                <b-link @click="onSelectAllItems">select all {{ totalItems }} items</b-link>
            </b>
        </div>
        <b-table
            v-if="operation"
            v-model="items"
            :fields="fields"
            :items="itemsProvider"
            :per-page="perPage"
            :current-page="currentPage"
            :busy="isBusy"
            @sort-changed="onSort"
            hover
            no-local-sorting
            no-provider-filtering
            sticky-header="50vh"
            data-test-id="review-table">
            <template v-slot:head(selected)>
                <b-form-checkbox
                    v-model="allSelected"
                    :indeterminate="indeterminate"
                    @change="toggleSelectAll"
                    data-test-id="select-all-checkbox" />
            </template>
            <template v-slot:cell(selected)="data">
                <b-form-checkbox
                    v-model="selectedItems"
                    :checked="allSelected"
                    :key="data.index"
                    :value="data.item"></b-form-checkbox>
            </template>
            <template v-slot:cell(update_time)="data">
                <UtcDate :date="data.value" mode="elapsed" />
            </template>
        </b-table>
        <template v-slot:modal-footer>
            <span v-if="rowLimitReached" class="font-italic">{{ rowLimitReachedText }}</span>
            <b-pagination v-if="hasPages" v-model="currentPage" :total-rows="totalRows" :per-page="perPage" />
            <b-button
                :disabled="!hasItemsSelected"
                :variant="deleteButtonVariant"
                v-b-modal.confirmation-modal
                class="mx-2"
                data-test-id="delete-button">
                {{ permanentlyDeleteText }} {{ deleteItemsText }}
            </b-button>
        </template>

        <b-modal
            id="confirmation-modal"
            :title="confirmationTitle"
            title-tag="h2"
            :ok-title="permanentlyDeleteText"
            :ok-variant="confirmButtonVariant"
            :ok-disabled="!confirmChecked"
            @show="resetConfirmationModal"
            @ok="onConfirmCleanupSelectedItems"
            static
            centered>
            <b-form-checkbox id="confirm-delete-checkbox" v-model="confirmChecked" data-test-id="agreement-checkbox">
                {{ agreementText }}
            </b-form-checkbox>
        </b-modal>
    </b-modal>
</template>

<script>
import _l from "utils/localization";
import { bytesToString } from "utils/utils";
import UtcDate from "components/UtcDate";
import { CleanupOperation } from "./model";

export default {
    components: {
        UtcDate,
    },
    props: {
        operation: {
            type: CleanupOperation,
            required: false,
            default: null,
        },
        totalItems: {
            type: Number,
            required: false,
            default: 0,
        },
        show: {
            type: Boolean,
            required: false,
        },
    },
    created() {
        this.showDialog = this.show;
    },
    data() {
        return {
            fields: [
                {
                    key: "selected",
                    label: "",
                    sortable: false,
                },
                {
                    key: "name",
                    sortable: true,
                },
                {
                    key: "size",
                    sortable: true,
                    formatter: this.toNiceSize,
                },
                {
                    label: "Updated",
                    key: "update_time",
                    sortable: true,
                },
            ],
            sortBy: "size",
            sortDesc: true,
            perPage: 50,
            currentPage: 1,
            totalRows: 1,
            allSelected: false,
            indeterminate: false,
            showDialog: false,
            items: [],
            selectedItems: [],
            itemLimit: 500,
            confirmChecked: false,
            permanentlyDeleteText: _l("Permanently delete"),
            captionText: _l("To free up account space, review and select items to be permanently deleted or"),
            agreementText: _l("I understand that once I delete the items, they cannot be recovered."),
            isBusy: false,
        };
    },
    methods: {
        toNiceSize(sizeInBytes) {
            return bytesToString(sizeInBytes, true);
        },
        toggleSelectAll(checked) {
            this.selectedItems = checked ? this.items : [];
        },
        hideModal() {
            this.showDialog = false;
        },
        onShowModal() {
            this.resetModal();
        },
        resetModal() {
            this.selectedItems = [];
        },
        resetConfirmationModal() {
            this.confirmChecked = false;
        },
        onConfirmCleanupSelectedItems() {
            this.$emit("onConfirmCleanupSelectedItems", this.selectedItems);
            this.hideModal();
        },
        onSort(props) {
            this.sortBy = props.sortBy;
            this.sortDesc = props.sortDesc;
        },
        async itemsProvider(ctx) {
            try {
                const page = ctx.currentPage > 0 ? ctx.currentPage - 1 : 0;
                const offset = page * ctx.perPage;
                const options = {
                    offset: offset,
                    limit: ctx.perPage,
                    sortBy: this.sortBy,
                    sortDesc: this.sortDesc,
                };
                const result = await this.operation.fetchItems(options);
                return result;
            } catch (error) {
                return [];
            }
        },
        async onSelectAllItems() {
            this.isBusy = true;
            const options = {
                offset: 0,
                limit: this.totalRows,
                sortBy: this.sortBy,
                sortDesc: this.sortDesc,
            };
            const allItems = await this.operation.fetchItems(options);
            this.selectedItems = allItems;
            this.isBusy = false;
        },
    },
    computed: {
        /** @returns {Number} */
        selectedItemCount() {
            return this.selectedItems.length;
        },
        /** @returns {Boolean} */
        hasItemsSelected() {
            return this.selectedItems.length > 0;
        },
        /** @returns {Boolean} */
        hasPages() {
            return this.totalRows > this.perPage;
        },
        /** @returns {String} */
        title() {
            return this.operation ? this.operation.name : "";
        },
        /** @returns {String} */
        confirmationTitle() {
            return `Permanently delete ${this.selectedItemCount} items?`;
        },
        /** @returns {String} */
        deleteButtonVariant() {
            return this.hasItemsSelected ? "danger" : "";
        },
        /** @returns {String} */
        deleteItemsText() {
            return this.hasItemsSelected ? `${this.selectedItemCount} items` : "";
        },
        /** @returns {String} */
        confirmButtonVariant() {
            return this.confirmChecked ? "danger" : "";
        },
        /** @returns {Boolean} */
        rowLimitReached() {
            return this.totalRows >= this.itemLimit;
        },
        /** @returns {String} */
        rowLimitReachedText() {
            return _l(
                `Displaying a maximum of ${this.itemLimit} items here. If there are more, you can rerun this operation after deleting some.`
            );
        },
    },
    watch: {
        totalItems(newVal) {
            this.totalRows = newVal;
        },
        selectedItems(newVal) {
            if (newVal.length === 0) {
                this.indeterminate = false;
                this.allSelected = false;
            } else if (newVal.length === this.items.length) {
                this.indeterminate = false;
                this.allSelected = true;
            } else {
                this.indeterminate = true;
                this.allSelected = false;
            }
        },
    },
};
</script>
