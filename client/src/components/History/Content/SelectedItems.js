/**
 * This is simple list management for the moment, but if I remember right we have plans for a more
 * abstracted selection scheme in the future for purposes of handling large bulk operations on the
 * server, this is a good place to implement that logic.
 */

export default {
    props: {
        scopeKey: { type: String, required: true },
        getItemKey: { type: Function, required: true },
    },
    data() {
        return {
            items: new Map(),
            showSelection: false,
        };
    },
    computed: {
        selectionSize() {
            return this.items.size;
        },
    },
    methods: {
        setShowSelection(val) {
            this.showSelection = val;
        },
        isSelected(item) {
            const key = this.getItemKey(item);
            return this.items.has(key);
        },
        setSelected(item, selected) {
            const key = this.getItemKey(item);
            const newSelected = new Map(this.items);
            selected ? newSelected.set(key, item) : newSelected.delete(key);
            this.items = newSelected;
        },
        selectItems(items = []) {
            const newItems = [...this.items.values(), ...items];
            const newEntries = newItems.map((item) => {
                const key = this.getItemKey(item);
                return [key, item];
            });
            this.items = new Map(newEntries);
        },
        reset() {
            this.items = new Map();
        },
    },
    watch: {
        scopeKey(newKey, oldKey) {
            if (newKey !== oldKey) {
                this.reset();
            }
        },
        selectionSize(newSize) {
            if (newSize > 0) {
                this.showSelection = true;
            }
        },
        showSelection(newVal) {
            if (!newVal) {
                this.reset();
            }
        },
    },
    render() {
        return this.$scopedSlots.default({
            selectedItems: this.items,
            showSelection: this.showSelection,
            setShowSelection: this.setShowSelection,
            selectItems: this.selectItems,
            isSelected: this.isSelected,
            setSelected: this.setSelected,
            resetSelection: this.reset,
        });
    },
};
