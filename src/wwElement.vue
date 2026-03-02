<template>
    <div class="mb-root" :style="rootStyles">
        <!-- ═══════════ SUCCESS OVERLAY ═══════════ -->
        <transition name="mb-overlay-fade">
            <div v-if="submitPhase === 'succeeded'" class="mb-success-overlay">
                <div class="mb-success-card">
                    <svg class="mb-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <p class="mb-success-text">Request submitted successfully</p>
                </div>
            </div>
        </transition>

        <!-- ═══════════ HEADER ═══════════ -->
        <div class="mb-header">
            <div class="mb-header-left">
                <h2 class="mb-title">{{ isEditMode ? 'Edit Mockup Request' : 'New Mockup Request' }}</h2>
                <span v-if="isEditMode" class="mb-edit-badge">Editing</span>
            </div>
            <div v-if="isDirty" class="mb-header-right">
                <span class="mb-unsaved-dot"></span>
                <span class="mb-unsaved-label">Unsaved changes</span>
            </div>
        </div>

        <!-- ═══════════ FORM BODY ═══════════ -->
        <div class="mb-body" :class="{ 'is-disabled': isFormDisabled }">

            <!-- ROW: Title -->
            <div class="mb-field" :class="{ 'has-error': touched.title && !form.title }">
                <label class="mb-label">Title <span class="mb-req">*</span></label>
                <input
                    ref="titleInput"
                    type="text"
                    class="mb-input"
                    placeholder="Enter request title..."
                    :value="form.title"
                    :disabled="isFormDisabled"
                    @input="form.title = $event.target.value"
                    @blur="touched.title = true"
                />
                <span v-if="touched.title && !form.title" class="mb-error">Title is required</span>
            </div>

            <!-- ROW: Type -->
            <div class="mb-field">
                <label class="mb-label">Request Type</label>
                <div class="mb-toggle-group">
                    <button
                        type="button"
                        class="mb-toggle-btn"
                        :class="{ 'is-active': form.type === 'mockup' }"
                        :disabled="isFormDisabled"
                        @click="form.type = 'mockup'"
                    >Mockup</button>
                    <button
                        type="button"
                        class="mb-toggle-btn"
                        :class="{ 'is-active': form.type === 'custom' }"
                        :disabled="isFormDisabled"
                        @click="form.type = 'custom'"
                    >Custom</button>
                </div>
            </div>

            <!-- ROW: Requestor (PIC) -->
            <div class="mb-field" :class="{ 'has-error': touched.pic && !form.pic_id }">
                <label class="mb-label">Requestor (PIC) <span class="mb-req">*</span></label>
                <div class="mb-select-wrap" ref="picSelectEl">
                    <div v-if="form.pic_id && selectedTeammate" class="mb-selected-chip" @click="clearPic">
                        <span class="mb-chip-name">{{ selectedTeammate.name }}</span>
                        <span class="mb-chip-type">{{ selectedTeammate.type }}</span>
                        <svg class="mb-chip-x" viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
                    </div>
                    <template v-else>
                        <input
                            type="text"
                            class="mb-input"
                            placeholder="Search teammates..."
                            :value="picSearch"
                            :disabled="isFormDisabled"
                            @input="picSearch = $event.target.value; picDropdownOpen = true"
                            @focus="picDropdownOpen = true"
                            @blur="onPicBlur"
                        />
                        <transition name="mb-dropdown">
                            <div v-if="picDropdownOpen && filteredTeammates.length" class="mb-dropdown">
                                <div
                                    v-for="tm in filteredTeammates"
                                    :key="tm.id"
                                    class="mb-dropdown-item"
                                    @mousedown.prevent="selectPic(tm)"
                                >
                                    <span class="mb-dd-name">{{ tm.name }}</span>
                                    <span class="mb-dd-type">{{ tm.type }}</span>
                                </div>
                            </div>
                        </transition>
                    </template>
                </div>
                <span v-if="touched.pic && !form.pic_id" class="mb-error">Requestor is required</span>
            </div>

            <!-- ROW: Client -->
            <div class="mb-field" :class="{ 'has-error': touched.client && !form.client }">
                <label class="mb-label">Client <span class="mb-req">*</span></label>
                <input
                    type="text"
                    class="mb-input"
                    placeholder="Enter client name..."
                    :value="form.client"
                    :disabled="isFormDisabled"
                    @input="form.client = $event.target.value"
                    @blur="touched.client = true"
                />
                <span v-if="touched.client && !form.client" class="mb-error">Client is required</span>
            </div>

            <!-- ROW: Folder -->
            <div class="mb-field">
                <label class="mb-label">{{ form.type === 'mockup' ? 'Mockup Reference Folder' : 'Request Folder' }}</label>
                <input
                    type="text"
                    class="mb-input"
                    placeholder="Paste folder link..."
                    :value="form.mockup_folder"
                    :disabled="isFormDisabled"
                    @input="form.mockup_folder = $event.target.value"
                />
            </div>

            <!-- ═══════════ PRODUCTS SUB-TOOL ═══════════ -->
            <div class="mb-section" v-if="form.type === 'mockup'">
                <div class="mb-section-header">
                    <h3 class="mb-section-title">
                        <svg class="mb-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        Products
                    </h3>
                    <span class="mb-section-count">{{ form.lineItems.length }} item{{ form.lineItems.length !== 1 ? 's' : '' }}</span>
                </div>

                <!-- Empty state -->
                <div v-if="form.lineItems.length === 0" class="mb-products-empty">
                    <svg class="mb-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7h8M8 12h5"/></svg>
                    <p>No products added yet</p>
                </div>

                <!-- Line items -->
                <div v-else class="mb-lines">
                    <div
                        v-for="(line, idx) in form.lineItems"
                        :key="line._uid"
                        class="mb-line-card"
                        :class="{ 'is-dragging': draggedLineIndex === idx, 'is-drag-over': dragOverIndex === idx }"
                        @dragover.prevent="onLineDragOver($event, idx)"
                        @dragleave="onLineDragLeave"
                        @drop.prevent="onLineDrop($event, idx)"
                    >
                        <div class="mb-line-top">
                            <span
                                class="mb-line-drag-handle"
                                draggable="true"
                                :class="{ 'is-disabled': isFormDisabled }"
                                @dragstart="onLineDragStart($event, idx)"
                                @dragend="onLineDragEnd"
                                title="Drag to reorder"
                            >
                                <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M3 4h2v2H3V4zm4 0h2v2H7V4zm4 0h2v2h-2V4zM3 7h2v2H3V7zm4 0h2v2H7V7zm4 0h2v2h-2V7zM3 10h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2z"/></svg>
                            </span>
                            <span class="mb-line-number">#{{ idx + 1 }}</span>
                            <button type="button" class="mb-line-remove" :disabled="isFormDisabled" @click="removeLine(idx)" title="Remove item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>

                        <!-- SKU display (already selected) -->
                        <div v-if="line.sku" class="mb-line-product">
                            <img v-if="line._resolved?.imagelink" :src="line._resolved.imagelink" :alt="line.sku" class="mb-line-img" />
                            <div v-else class="mb-line-img-ph">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            </div>
                            <div class="mb-line-info">
                                <span class="mb-line-model">{{ line._resolved?.model || 'Unknown' }}</span>
                                <span class="mb-line-variant">{{ [line._resolved?.color, line._resolved?.size].filter(Boolean).join(' · ') }}</span>
                                <span class="mb-line-sku">{{ line.sku }}</span>
                            </div>
                            <button type="button" class="mb-line-change-sku" :disabled="isFormDisabled" @click="reopenSkuSearch(idx)" title="Change SKU">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                        </div>

                        <!-- SKU search (not yet selected or changing) -->
                        <div v-else class="mb-sku-search-wrap">
                            <input
                                :ref="el => { if (el) skuInputRefs[line._uid] = el; }"
                                type="text"
                                class="mb-input mb-sku-input"
                                placeholder="Search SKU, model, or color..."
                                :value="line._searchQuery"
                                :disabled="isFormDisabled"
                                @input="line._searchQuery = $event.target.value; line._dropdownOpen = true"
                                @focus="line._dropdownOpen = true"
                                @blur="onSkuBlur(idx)"
                            />
                            <transition name="mb-dropdown">
                                <div v-if="line._dropdownOpen && filteredInventory(line._searchQuery).length" class="mb-dropdown mb-dropdown--sku">
                                    <div
                                        v-for="item in filteredInventory(line._searchQuery)"
                                        :key="item.sku"
                                        class="mb-dropdown-item mb-dropdown-item--sku"
                                        @mousedown.prevent="selectSku(idx, item)"
                                    >
                                        <img v-if="item.imagelink" :src="item.imagelink" :alt="item.sku" class="mb-dd-img" />
                                        <div v-else class="mb-dd-img-ph"></div>
                                        <div class="mb-dd-details">
                                            <span class="mb-dd-model">{{ item.model }}</span>
                                            <span class="mb-dd-variant">{{ item.color }} · {{ item.size }}</span>
                                        </div>
                                        <span class="mb-dd-sku-code">{{ item.sku }}</span>
                                    </div>
                                </div>
                            </transition>
                        </div>

                        <!-- Per-line fields -->
                        <div v-if="line.sku" class="mb-line-fields">
                            <div class="mb-line-field">
                                <label class="mb-mini-label">Qty</label>
                                <input
                                    type="number"
                                    class="mb-input mb-input--sm"
                                    min="1"
                                    :value="line.quantity"
                                    :disabled="isFormDisabled"
                                    @input="line.quantity = Math.max(1, parseInt($event.target.value) || 1)"
                                />
                            </div>
                            <div class="mb-line-field mb-line-field--grow">
                                <label class="mb-mini-label">Customization</label>
                                <select
                                    class="mb-input mb-select"
                                    :value="line.customization_type"
                                    :disabled="isFormDisabled"
                                    @change="line.customization_type = $event.target.value"
                                >
                                    <option v-for="opt in custOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                            </div>
                            <div class="mb-line-field mb-line-field--full">
                                <label class="mb-mini-label">Remarks</label>
                                <input
                                    type="text"
                                    class="mb-input mb-input--sm"
                                    placeholder="Position, reference design..."
                                    :value="line.remarks"
                                    :disabled="isFormDisabled"
                                    @input="line.remarks = $event.target.value"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add SKU button -->
                <button
                    type="button"
                    class="mb-add-sku-btn"
                    :disabled="isFormDisabled"
                    @click="addLine"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add SKU
                </button>

                <span v-if="touched.lines && form.lineItems.length === 0" class="mb-error">At least one product is required</span>
            </div>

            <!-- ROW: Remarks -->
            <div class="mb-field">
                <label class="mb-label">{{ form.type === 'mockup' ? 'Additional Remarks' : 'Request Remarks' }}</label>
                <textarea
                    class="mb-input mb-textarea"
                    :placeholder="form.type === 'mockup' ? 'Any additional notes...' : 'Describe your request...'"
                    :value="form.additionalRemarks"
                    :disabled="isFormDisabled"
                    @input="form.additionalRemarks = $event.target.value"
                    rows="3"
                ></textarea>
                <span class="mb-char-count">{{ (form.additionalRemarks || '').length }} / 500</span>
            </div>

            <!-- ROW: Deadline -->
            <div class="mb-field" :class="{ 'has-error': touched.deadline && !form.deadlineDate }">
                <label class="mb-label">Deadline <span class="mb-req">*</span></label>
                <div class="mb-deadline-row">
                    <input
                        type="date"
                        class="mb-input mb-input--date"
                        :value="form.deadlineDate"
                        :disabled="isFormDisabled"
                        @input="form.deadlineDate = $event.target.value"
                        @blur="touched.deadline = true"
                    />
                    <input
                        type="time"
                        class="mb-input mb-input--time"
                        :value="form.deadlineTime"
                        :disabled="isFormDisabled"
                        @input="form.deadlineTime = $event.target.value"
                    />
                    <span v-if="isUrgent" class="mb-urgent-tag">URGENT</span>
                </div>
                <span v-if="touched.deadline && !form.deadlineDate" class="mb-error">Deadline is required</span>
                <span v-else-if="isUrgent" class="mb-urgent-hint">Deadline is within 24 hours</span>
            </div>
        </div>

        <!-- ═══════════ REVIEW PANEL (inline, above footer) ═══════════ -->
        <transition name="mb-review-expand">
            <div v-if="showReview" class="mb-review-panel">
                <div class="mb-review-header">
                    <h3 class="mb-review-title">Review Your Request</h3>
                    <button type="button" class="mb-review-close" @click="showReview = false">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="mb-review-body">
                    <div class="mb-review-row"><span class="mb-review-label">Title</span><span class="mb-review-value">{{ form.title }}</span></div>
                    <div class="mb-review-row"><span class="mb-review-label">Type</span><span class="mb-review-value">{{ form.type }}</span></div>
                    <div class="mb-review-row"><span class="mb-review-label">Requestor</span><span class="mb-review-value">{{ selectedTeammate?.name || '-' }}</span></div>
                    <div class="mb-review-row"><span class="mb-review-label">Client</span><span class="mb-review-value">{{ form.client }}</span></div>
                    <div v-if="form.mockup_folder" class="mb-review-row"><span class="mb-review-label">{{ form.type === 'mockup' ? 'Mockup Folder' : 'Request Folder' }}</span><span class="mb-review-value mb-review-link">{{ form.mockup_folder }}</span></div>
                    <div v-if="form.type === 'mockup'" class="mb-review-row mb-review-row--block">
                        <span class="mb-review-label">Products ({{ form.lineItems.length }})</span>
                        <div class="mb-review-lines">
                            <div v-for="(line, i) in form.lineItems" :key="line._uid" class="mb-review-line">
                                <span class="mb-review-line-num">{{ i + 1 }}.</span>
                                <span class="mb-review-line-sku">{{ line.sku }}</span>
                                <span class="mb-review-line-detail">Qty: {{ line.quantity }} · {{ line.customization_type || 'None' }}</span>
                                <span v-if="line.remarks" class="mb-review-line-remarks">{{ line.remarks }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="form.additionalRemarks" class="mb-review-row"><span class="mb-review-label">{{ form.type === 'mockup' ? 'Additional Remarks' : 'Request Remarks' }}</span><span class="mb-review-value">{{ form.additionalRemarks }}</span></div>
                    <div class="mb-review-row">
                        <span class="mb-review-label">Deadline</span>
                        <span class="mb-review-value">
                            {{ form.deadlineDate }} {{ form.deadlineTime || '00:00' }}
                            <span v-if="isUrgent" class="mb-urgent-tag mb-urgent-tag--sm">URGENT</span>
                        </span>
                    </div>
                </div>
            </div>
        </transition>

        <!-- ═══════════ FOOTER ═══════════ -->
        <div class="mb-footer">
            <div class="mb-footer-left">
                <span v-if="submitPhase === 'failed'" class="mb-footer-error">Submission failed. Please try again.</span>
            </div>
            <div class="mb-footer-right">
                <button
                    type="button"
                    class="mb-btn mb-btn--secondary"
                    :disabled="isFormDisabled"
                    @click="resetForm"
                >Cancel</button>

                <!-- Review step -->
                <button
                    v-if="!showReview"
                    type="button"
                    class="mb-btn mb-btn--primary"
                    :disabled="isFormDisabled || !isFormValid"
                    @click="openReview"
                >Review &amp; Submit</button>
                <button
                    v-else
                    type="button"
                    class="mb-btn mb-btn--primary mb-btn--submit"
                    :disabled="isFormDisabled"
                    @click="doSubmit"
                >
                    <template v-if="submitPhase === 'attempting'">
                        <span class="mb-spinner"></span> Submitting...
                    </template>
                    <template v-else>Confirm Submit</template>
                </button>
            </div>
        </div>

        <!-- ═══════════ TOAST ═══════════ -->
        <transition name="mb-toast">
            <div v-if="toast.visible" class="mb-toast" :class="'mb-toast--' + toast.type">
                {{ toast.message }}
            </div>
        </transition>
    </div>
</template>

<script>
function generateUid() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function klNow() {
    return new Date().toLocaleString('en-CA', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    }).replace(',', '').replace(/(\d{4})-(\d{2})-(\d{2})\s/, '$1-$2-$3T') + '+08:00';
}

function createEmptyLine() {
    return {
        _uid: generateUid(),
        _searchQuery: '',
        _dropdownOpen: false,
        _resolved: null,
        sku: '',
        quantity: 1,
        customization_type: 'None',
        remarks: '',
    };
}

export default {
    props: {
        content: { type: Object, default: () => ({}) },
        uid: { type: String, default: '' },
        /* wwEditor:start */
        wwEditorState: { type: Object, default: () => ({}) },
        /* wwEditor:end */
    },
    emits: ['trigger-event', 'update:content'],
    data() {
        return {
            form: {
                title: '',
                type: 'mockup',
                pic_id: '',
                client: '',
                mockup_folder: '',
                lineItems: [],
                additionalRemarks: '',
                deadlineDate: '',
                deadlineTime: '',
            },
            picSearch: '',
            picDropdownOpen: false,
            touched: {
                title: false,
                pic: false,
                client: false,
                lines: false,
                deadline: false,
            },
            showReview: false,
            submitPhase: 'idle',
            originalSnapshot: null,
            toast: { visible: false, message: '', type: 'info' },
            skuInputRefs: {},
            draggedLineIndex: null,
            dragOverIndex: null,
            _toastTimer: null,
            _initDone: false,
        };
    },
    computed: {
        rootStyles() {
            const c = this.content || {};
            return {
                '--mb-form-bg': c.formBgColor || '#ffffff',
                '--mb-card-bg': c.cardBgColor || '#f9fafb',
                '--mb-border': c.borderColor || '#e5e7eb',
                '--mb-accent': c.accentColor || '#3b82f6',
                '--mb-accent-hover': c.accentHoverColor || '#2563eb',
                '--mb-urgent': c.urgentColor || '#ef4444',
                '--mb-text': c.textColor || '#111827',
                '--mb-muted': c.mutedTextColor || '#6b7280',
                '--mb-btn-bg': c.btnBgColor || '#111827',
                '--mb-btn-text': c.btnTextColor || '#ffffff',
                '--mb-btn-hover': c.btnHoverColor || '#1f2937',
                '--mb-btn-radius': c.btnRadius || '6px',
                '--mb-radius': c.borderRadius || '10px',
                '--mb-font': c.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                '--mb-font-size': c.fontSize || '13px',
            };
        },
        teammates() {
            return Array.isArray(this.content?.teammatesData) ? this.content.teammatesData : [];
        },
        inventory() {
            return Array.isArray(this.content?.inventoryData) ? this.content.inventoryData : [];
        },
        custOptions() {
            const opts = this.content?.customizationOptions;
            if (Array.isArray(opts) && opts.length) return opts;
            return [{ label: 'None', value: 'None' }];
        },
        editingData() {
            return this.content?.editingData || null;
        },
        isEditMode() {
            return !!this.editingData?.id;
        },
        selectedTeammate() {
            if (!this.form.pic_id) return null;
            return this.teammates.find(t => t.id === this.form.pic_id) || null;
        },
        filteredTeammates() {
            const q = (this.picSearch || '').toLowerCase().trim();
            if (!q) return this.teammates.slice(0, 30);
            return this.teammates.filter(t => {
                const hay = `${t.name || ''} ${t.mastername || ''} ${t.email || ''} ${t.type || ''}`.toLowerCase();
                return hay.includes(q);
            }).slice(0, 30);
        },
        isUrgent() {
            if (!this.form.deadlineDate) return false;
            const deadline = new Date(`${this.form.deadlineDate}T${this.form.deadlineTime || '00:00'}:00+08:00`);
            const now = new Date();
            const diffMs = deadline.getTime() - now.getTime();
            return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
        },
        isFormValid() {
            if (!this.form.title?.trim()) return false;
            if (!this.form.pic_id) return false;
            if (!this.form.client?.trim()) return false;
            if (!this.form.deadlineDate) return false;
            if (this.form.type === 'mockup') {
                if (this.form.lineItems.length === 0) return false;
                if (this.form.lineItems.some(l => !l.sku)) return false;
                if (this.form.lineItems.some(l => !l.quantity || l.quantity < 1)) return false;
            }
            return true;
        },
        isDirty() {
            if (!this.originalSnapshot) return false;
            return JSON.stringify(this.formSnapshot()) !== this.originalSnapshot;
        },
        isFormDisabled() {
            return this.submitPhase === 'attempting' || this.submitPhase === 'succeeded';
        },
    },
    watch: {
        editingData: {
            handler(val) {
                if (val?.id) {
                    this.loadEditingData(val);
                }
            },
            immediate: true,
            deep: true,
        },
        'content.actionStatus'(val) {
            if (!val || this.submitPhase !== 'attempting') return;
            if (val === 'successful') {
                this.submitPhase = 'succeeded';
                setTimeout(() => {
                    this.resetForm();
                    this.submitPhase = 'idle';
                }, 1800);
            } else if (val === 'failed') {
                this.submitPhase = 'failed';
                this.showToast('Submission failed. Please try again.', 'error');
            }
        },
    },
    mounted() {
        if (!this.isEditMode) {
            this.takeSnapshot();
            this._initDone = true;
            this.$nextTick(() => {
                this.$refs.titleInput?.focus();
            });
        }
        document.addEventListener('keydown', this.onGlobalKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.onGlobalKeydown);
        if (this._toastTimer) clearTimeout(this._toastTimer);
    },
    methods: {
        /* ── Snapshots for dirty tracking ── */
        formSnapshot() {
            return {
                title: this.form.title,
                type: this.form.type,
                pic_id: this.form.pic_id,
                client: this.form.client,
                mockup_folder: this.form.mockup_folder,
                lineItems: this.form.lineItems.map(l => ({
                    sku: l.sku,
                    quantity: l.quantity,
                    customization_type: l.customization_type,
                    remarks: l.remarks,
                })),
                additionalRemarks: this.form.additionalRemarks,
                deadlineDate: this.form.deadlineDate,
                deadlineTime: this.form.deadlineTime,
            };
        },
        takeSnapshot() {
            this.originalSnapshot = JSON.stringify(this.formSnapshot());
        },

        /* ── Edit mode loading ── */
        loadEditingData(data) {
            this.form.title = data.title || '';
            this.form.type = data.type || 'mockup';
            this.form.pic_id = data.pic_id || '';
            this.form.client = data.client || '';
            this.form.mockup_folder = data.mockup_folder || '';
            this.form.additionalRemarks = data.additional_remarks || '';

            if (data.user_deadline) {
                try {
                    const d = new Date(data.user_deadline);
                    const pad = n => String(n).padStart(2, '0');
                    this.form.deadlineDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
                    this.form.deadlineTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
                } catch {
                    this.form.deadlineDate = '';
                    this.form.deadlineTime = '';
                }
            }

            const details = Array.isArray(data.mockup_details) ? data.mockup_details : [];
            this.form.lineItems = details.map(d => {
                const resolved = this.inventory.find(inv => inv.sku === d.sku) || null;
                return {
                    _uid: generateUid(),
                    _searchQuery: '',
                    _dropdownOpen: false,
                    _resolved: resolved,
                    sku: d.sku || '',
                    quantity: d.quantity || 1,
                    customization_type: d.customization_type || 'None',
                    remarks: d.remarks || '',
                };
            });

            this.$nextTick(() => this.takeSnapshot());
            this._initDone = true;
        },

        /* ── PIC dropdown ── */
        selectPic(tm) {
            this.form.pic_id = tm.id;
            this.picSearch = '';
            this.picDropdownOpen = false;
            this.touched.pic = true;
        },
        clearPic() {
            if (this.isFormDisabled) return;
            this.form.pic_id = '';
            this.picSearch = '';
        },
        onPicBlur() {
            setTimeout(() => { this.picDropdownOpen = false; }, 150);
        },

        /* ── SKU line items ── */
        addLine() {
            const line = createEmptyLine();
            this.form.lineItems.push(line);
            this.$nextTick(() => {
                const input = this.skuInputRefs[line._uid];
                if (input) { input.focus(); input.select(); }
            });
        },
        removeLine(idx) {
            const uid = this.form.lineItems[idx]?._uid;
            this.form.lineItems.splice(idx, 1);
            if (uid) delete this.skuInputRefs[uid];
        },
        onLineDragStart(e, idx) {
            if (this.isFormDisabled) return;
            this.draggedLineIndex = idx;
            e.dataTransfer.setData('text/plain', String(idx));
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.dropEffect = 'move';
        },
        onLineDragEnd() {
            this.draggedLineIndex = null;
            this.dragOverIndex = null;
        },
        onLineDragOver(e, idx) {
            e.preventDefault();
            if (this.draggedLineIndex === null || this.draggedLineIndex === idx) return;
            this.dragOverIndex = idx;
        },
        onLineDragLeave() {
            this.dragOverIndex = null;
        },
        onLineDrop(e, dropIdx) {
            e.preventDefault();
            this.dragOverIndex = null;
            const dragIdx = this.draggedLineIndex;
            if (dragIdx == null || dragIdx === dropIdx) return;
            const item = this.form.lineItems.splice(dragIdx, 1)[0];
            const insertIdx = dropIdx > dragIdx ? dropIdx - 1 : dropIdx;
            this.form.lineItems.splice(insertIdx, 0, item);
            this.draggedLineIndex = null;
        },
        reopenSkuSearch(idx) {
            const line = this.form.lineItems[idx];
            line.sku = '';
            line._resolved = null;
            line._searchQuery = '';
            line._dropdownOpen = true;
            this.$nextTick(() => {
                const input = this.skuInputRefs[line._uid];
                if (input) { input.focus(); input.select(); }
            });
        },
        selectSku(idx, item) {
            const line = this.form.lineItems[idx];
            line.sku = item.sku;
            line._resolved = item;
            line._searchQuery = '';
            line._dropdownOpen = false;
        },
        onSkuBlur(idx) {
            setTimeout(() => {
                if (this.form.lineItems[idx]) {
                    this.form.lineItems[idx]._dropdownOpen = false;
                }
            }, 150);
        },
        filteredInventory(query) {
            const q = (query || '').toLowerCase().trim();
            const source = this.inventory;
            if (!q) return source.slice(0, 40);
            return source.filter(item => {
                const hay = `${item.model || ''} ${item.color || ''} ${item.sku || ''} ${item.type || ''} ${item.size || ''}`.toLowerCase();
                return hay.includes(q);
            }).slice(0, 40);
        },
        /* ── Review & Submit ── */
        openReview() {
            this.touched = { title: true, pic: true, client: true, lines: true, deadline: true };
            if (!this.isFormValid) return;
            this.showReview = true;
        },
        doSubmit() {
            if (!this.isFormValid || this.submitPhase === 'attempting') return;
            this.submitPhase = 'attempting';
            this.showReview = false;

            const now = klNow();
            const isEdit = this.isEditMode;
            const action = isEdit ? 'edit_submission' : 'new_submission';

            const mockupDetails = this.form.lineItems.map(l => ({
                sku: l.sku,
                quantity: l.quantity,
                customization_type: l.customization_type,
                remarks: l.remarks,
            }));

            const deadlineStr = this.form.deadlineDate
                ? `${this.form.deadlineDate}T${this.form.deadlineTime || '00:00'}:00+08:00`
                : null;

            const history = isEdit
                ? [...(this.editingData.history || []), { action: 'edited_submission', description: this.buildChangeDescription() }]
                : [{ action: 'new_submission', description: 'Created new mockup request' }];

            const payload = {
                action,
                id: isEdit ? this.editingData.id : null,
                created_at: isEdit ? this.editingData.created_at : now,
                updated_at: now,
                title: this.form.title.trim(),
                type: this.form.type,
                pic_id: this.form.pic_id,
                mockup_details: this.form.type === 'mockup' ? mockupDetails : [],
                mockup_folder: this.form.type === 'mockup' ? this.form.mockup_folder : '',
                history,
                client: this.form.client.trim(),
                user_deadline: deadlineStr,
            };

            this.$emit('trigger-event', { name: 'onAction', event: { value: payload } });

            setTimeout(() => {
                if (this.submitPhase === 'attempting') {
                    this.submitPhase = 'idle';
                    this.showToast('Event emitted — waiting for workflow response', 'info');
                }
            }, 8000);
        },
        buildChangeDescription() {
            if (!this.editingData) return 'Edited submission';
            const changes = [];
            const orig = this.editingData;
            if (this.form.title.trim() !== (orig.title || ''))
                changes.push(`Updated title from "${orig.title}" to "${this.form.title.trim()}"`);
            if (this.form.type !== (orig.type || ''))
                changes.push(`Changed type from "${orig.type}" to "${this.form.type}"`);
            if (this.form.pic_id !== (orig.pic_id || '')) {
                const oldName = this.teammates.find(t => t.id === orig.pic_id)?.name || orig.pic_id;
                const newName = this.selectedTeammate?.name || this.form.pic_id;
                changes.push(`Changed requestor from "${oldName}" to "${newName}"`);
            }
            if (this.form.client.trim() !== (orig.client || ''))
                changes.push(`Updated client from "${orig.client}" to "${this.form.client.trim()}"`);
            if (this.form.mockup_folder !== (orig.mockup_folder || ''))
                changes.push(`Updated mockup folder`);

            const origDetails = Array.isArray(orig.mockup_details) ? orig.mockup_details : [];
            const newDetails = this.form.lineItems.map(l => ({
                sku: l.sku, quantity: l.quantity, customization_type: l.customization_type, remarks: l.remarks,
            }));

            const origSkus = origDetails.map(d => d.sku);
            const newSkus = newDetails.map(d => d.sku);
            const added = newSkus.filter(s => !origSkus.includes(s));
            const removed = origSkus.filter(s => !newSkus.includes(s));
            if (added.length) changes.push(`Added SKU(s): ${added.join(', ')}`);
            if (removed.length) changes.push(`Removed SKU(s): ${removed.join(', ')}`);

            for (const nd of newDetails) {
                const od = origDetails.find(d => d.sku === nd.sku);
                if (!od) continue;
                if (nd.quantity !== od.quantity) changes.push(`Updated quantity for ${nd.sku} from ${od.quantity} to ${nd.quantity}`);
                if (nd.customization_type !== od.customization_type) changes.push(`Updated customization for ${nd.sku} from "${od.customization_type}" to "${nd.customization_type}"`);
                if (nd.remarks !== (od.remarks || '')) changes.push(`Updated remarks for ${nd.sku} from "${od.remarks || ''}" to "${nd.remarks}"`);
            }

            return changes.length ? changes.join('; ') : 'No field changes detected';
        },

        /* ── Form reset ── */
        resetForm() {
            this.form = {
                title: '',
                type: 'mockup',
                pic_id: '',
                client: '',
                mockup_folder: '',
                lineItems: [],
                additionalRemarks: '',
                deadlineDate: '',
                deadlineTime: '',
            };
            this.picSearch = '';
            this.picDropdownOpen = false;
            this.touched = { title: false, pic: false, client: false, lines: false, deadline: false };
            this.showReview = false;
            this.submitPhase = 'idle';
            this.takeSnapshot();
        },

        /* ── Toast ── */
        showToast(message, type = 'info') {
            if (this._toastTimer) clearTimeout(this._toastTimer);
            this.toast = { visible: true, message, type };
            this._toastTimer = setTimeout(() => { this.toast.visible = false; }, 3500);
        },

        /* ── Keyboard ── */
        onGlobalKeydown(e) {
            if (e.key === 'Escape') {
                this.picDropdownOpen = false;
                this.form.lineItems.forEach(l => { l._dropdownOpen = false; });
                if (this.showReview) this.showReview = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
$blue-50: #eff6ff;
$blue-100: #dbeafe;
$blue-500: #3b82f6;
$blue-600: #2563eb;
$green-50: #d1fae5;
$green-600: #059669;
$red-50: #fef2f2;
$red-500: #ef4444;
$red-600: #dc2626;
$amber-50: #fffbeb;
$amber-500: #f59e0b;
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-400: #9ca3af;
$gray-500: #6b7280;
$gray-600: #475569;
$gray-700: #374151;
$gray-800: #1e293b;
$gray-900: #111827;

$radius: 10px;
$radius-sm: 6px;
$radius-xs: 4px;
$transition: 0.15s ease;

.mb-root {
    position: relative;
    font-family: var(--mb-font);
    font-size: var(--mb-font-size);
    color: var(--mb-text);
    background: var(--mb-form-bg);
    border: 1px solid var(--mb-border);
    border-radius: var(--mb-radius);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-width: 720px;
    width: 100%;
}

/* ═══════════ HEADER ═══════════ */
.mb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--mb-border);
    background: var(--mb-card-bg);
}
.mb-header-left { display: flex; align-items: center; gap: 10px; }
.mb-title { font-size: 15px; font-weight: 600; margin: 0; color: var(--mb-text); }
.mb-edit-badge {
    font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    padding: 2px 8px; border-radius: 20px;
    background: $blue-100; color: $blue-600;
}
.mb-header-right { display: flex; align-items: center; gap: 6px; }
.mb-unsaved-dot { width: 6px; height: 6px; border-radius: 50%; background: $amber-500; }
.mb-unsaved-label { font-size: 11px; color: $amber-500; font-weight: 500; }

/* ═══════════ BODY ═══════════ */
.mb-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow-y: auto;
    flex: 1;
    &.is-disabled { opacity: 0.6; pointer-events: none; }
}

/* ═══════════ FIELD ═══════════ */
.mb-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    &.has-error .mb-input { border-color: $red-500; }
}
.mb-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--mb-text);
    text-transform: uppercase;
    letter-spacing: 0.3px;
}
.mb-req { color: $red-500; }
.mb-error { font-size: 11px; color: $red-500; font-weight: 500; }
.mb-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--mb-border);
    border-radius: $radius-sm;
    font-family: inherit;
    font-size: inherit;
    color: var(--mb-text);
    background: var(--mb-form-bg);
    outline: none;
    transition: border-color $transition, box-shadow $transition;
    box-sizing: border-box;
    &:focus { border-color: var(--mb-accent); box-shadow: 0 0 0 3px rgba($blue-500, 0.1); }
    &::placeholder { color: var(--mb-muted); }
    &:disabled { background: $gray-100; cursor: not-allowed; }
}
.mb-textarea { resize: vertical; min-height: 60px; }
.mb-char-count { font-size: 10px; color: var(--mb-muted); text-align: right; }

/* Toggle group */
.mb-toggle-group { display: flex; gap: 0; }
.mb-toggle-btn {
    flex: 1;
    padding: 8px 14px;
    border: 1px solid var(--mb-border);
    background: var(--mb-form-bg);
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    color: var(--mb-muted);
    cursor: pointer;
    transition: all $transition;
    &:first-child { border-radius: $radius-sm 0 0 $radius-sm; }
    &:last-child { border-radius: 0 $radius-sm $radius-sm 0; border-left: 0; }
    &.is-active {
        background: var(--mb-accent);
        border-color: var(--mb-accent);
        color: #fff;
    }
    &:hover:not(.is-active):not(:disabled) { background: $gray-50; }
}

/* ═══════════ SELECT / DROPDOWN ═══════════ */
.mb-select-wrap { position: relative; }
.mb-selected-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 12px;
    border: 1px solid var(--mb-border);
    border-radius: $radius-sm;
    background: $blue-50;
    cursor: pointer;
    transition: background $transition;
    &:hover { background: $blue-100; }
}
.mb-chip-name { font-weight: 500; color: var(--mb-text); }
.mb-chip-type { font-size: 10px; color: $blue-600; background: $blue-100; padding: 1px 6px; border-radius: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
.mb-chip-x { color: $gray-400; margin-left: auto; transition: color $transition; &:hover { color: $red-500; } }

.mb-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: var(--mb-form-bg);
    border: 1px solid var(--mb-border);
    border-radius: $radius-sm;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    z-index: 50;
    max-height: 220px;
    overflow-y: auto;
}
.mb-dropdown-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background $transition;
    &:hover { background: $gray-50; }
}
.mb-dd-name { font-weight: 500; color: var(--mb-text); }
.mb-dd-type { font-size: 10px; color: var(--mb-muted); text-transform: uppercase; }

/* SKU dropdown */
.mb-dropdown--sku { max-height: 280px; }
.mb-dropdown-item--sku { gap: 10px; }
.mb-dd-img { width: 36px; height: 36px; object-fit: cover; border-radius: $radius-xs; }
.mb-dd-img-ph { width: 36px; height: 36px; border-radius: $radius-xs; background: $gray-100; }
.mb-dd-details { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.mb-dd-model { font-weight: 500; font-size: 12px; color: var(--mb-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mb-dd-variant { font-size: 11px; color: var(--mb-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mb-dd-sku-code { font-size: 11px; color: var(--mb-muted); font-family: monospace; white-space: nowrap; }

.mb-select { appearance: none; cursor: pointer; padding-right: 28px; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }

/* ═══════════ PRODUCTS SECTION ═══════════ */
.mb-section {
    background: var(--mb-card-bg);
    border: 1px solid var(--mb-border);
    border-radius: $radius-sm;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.mb-section-header { display: flex; align-items: center; justify-content: space-between; }
.mb-section-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; margin: 0; color: var(--mb-text); }
.mb-section-icon { width: 16px; height: 16px; color: var(--mb-muted); }
.mb-section-count { font-size: 11px; color: var(--mb-muted); font-weight: 500; }

.mb-products-empty {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 24px 16px;
    color: var(--mb-muted);
    p { margin: 0; font-size: 12px; }
}
.mb-empty-icon { width: 32px; height: 32px; color: $gray-300; }

/* ═══════════ LINE ITEMS ═══════════ */
.mb-lines { display: flex; flex-direction: column; gap: 8px; }
.mb-line-card {
    background: var(--mb-form-bg);
    border: 1px solid var(--mb-border);
    border-radius: $radius-sm;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color $transition, box-shadow $transition, opacity $transition;
    &:hover { border-color: $gray-300; }
    &.is-dragging { opacity: 0.5; }
    &.is-drag-over { border-color: var(--mb-accent); box-shadow: 0 0 0 2px rgba($blue-500, 0.15); }
}
.mb-line-top {
    display: flex; align-items: center; gap: 8px;
}
.mb-line-drag-handle {
    display: flex; align-items: center; justify-content: center;
    width: 24px; height: 24px;
    color: $gray-400;
    cursor: grab;
    border-radius: $radius-xs;
    flex-shrink: 0;
    transition: color $transition, background $transition;
    &:hover:not(.is-disabled) { color: var(--mb-accent); background: $blue-50; }
    &:active:not(.is-disabled) { cursor: grabbing; }
    &.is-disabled { cursor: not-allowed; opacity: 0.5; }
}
.mb-line-number { font-size: 10px; font-weight: 700; color: var(--mb-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-right: auto; }
.mb-line-remove {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border: none; background: none;
    color: $gray-400; cursor: pointer; border-radius: $radius-xs;
    transition: all $transition;
    &:hover { background: $red-50; color: $red-500; }
}

.mb-line-product {
    display: flex; align-items: center; gap: 10px;
}
.mb-line-img { width: 44px; height: 44px; object-fit: cover; border-radius: $radius-xs; }
.mb-line-img-ph { width: 44px; height: 44px; border-radius: $radius-xs; background: $gray-100; display: flex; align-items: center; justify-content: center; color: $gray-300; }
.mb-line-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.mb-line-model { font-weight: 600; font-size: 12px; color: var(--mb-text); }
.mb-line-variant { font-size: 11px; color: var(--mb-muted); }
.mb-line-sku { font-size: 10px; color: var(--mb-muted); font-family: monospace; }
.mb-line-change-sku {
    display: flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border: none; background: none;
    color: $gray-400; cursor: pointer; border-radius: $radius-xs;
    transition: all $transition;
    &:hover { background: $blue-50; color: $blue-500; }
}

.mb-sku-search-wrap { position: relative; }
.mb-sku-input { font-size: 12px; }

.mb-line-fields {
    display: flex; flex-wrap: wrap; gap: 8px;
}
.mb-line-field {
    display: flex; flex-direction: column; gap: 3px;
    min-width: 70px;
    &--grow { flex: 1; min-width: 140px; }
    &--full { width: 100%; }
}
.mb-mini-label { font-size: 10px; font-weight: 600; color: var(--mb-muted); text-transform: uppercase; letter-spacing: 0.3px; }
.mb-input--sm { padding: 6px 10px; font-size: 12px; }

/* Add SKU button */
.mb-add-sku-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px;
    border: 1px dashed var(--mb-border);
    border-radius: $radius-sm;
    background: none;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    color: var(--mb-accent);
    cursor: pointer;
    transition: all $transition;
    &:hover { background: $blue-50; border-color: var(--mb-accent); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

/* ═══════════ DEADLINE ═══════════ */
.mb-deadline-row {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.mb-input--date { max-width: 160px; }
.mb-input--time { max-width: 120px; }
.mb-urgent-tag {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    padding: 3px 10px; border-radius: 20px;
    background: $red-50; color: var(--mb-urgent);
    animation: mb-pulse 2s ease-in-out infinite;
    &--sm { font-size: 9px; padding: 2px 7px; }
}
.mb-urgent-hint { font-size: 11px; color: var(--mb-urgent); font-weight: 500; }
@keyframes mb-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

/* ═══════════ FOOTER ═══════════ */
.mb-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    border-top: 1px solid var(--mb-border);
    background: var(--mb-card-bg);
}
.mb-footer-left { flex: 1; }
.mb-footer-error { font-size: 12px; color: $red-500; font-weight: 500; }
.mb-footer-right { display: flex; gap: 8px; }
.mb-btn {
    padding: 8px 18px;
    border: none;
    border-radius: var(--mb-btn-radius);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all $transition;
    display: flex; align-items: center; gap: 6px;
    &:disabled { opacity: 0.45; cursor: not-allowed; }
    &--secondary {
        background: var(--mb-form-bg);
        color: var(--mb-text);
        border: 1px solid var(--mb-border);
        &:hover:not(:disabled) { background: $gray-100; }
    }
    &--primary {
        background: var(--mb-btn-bg);
        color: var(--mb-btn-text);
        &:hover:not(:disabled) { background: var(--mb-btn-hover); }
    }
    &--submit { background: var(--mb-accent); &:hover:not(:disabled) { background: var(--mb-accent-hover); } }
}
.mb-spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: mb-spin 0.6s linear infinite;
}
@keyframes mb-spin { to { transform: rotate(360deg); } }

/* ═══════════ REVIEW PANEL ═══════════ */
.mb-review-panel {
    background: var(--mb-card-bg);
    border-top: 1px solid var(--mb-border);
    overflow: hidden;
}
.mb-review-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--mb-border);
    background: var(--mb-card-bg);
}
.mb-review-title { font-size: 14px; font-weight: 600; margin: 0; }
.mb-review-close {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border: none; background: none;
    color: $gray-400; cursor: pointer; border-radius: $radius-xs;
    transition: all $transition;
    &:hover { background: $gray-100; color: var(--mb-text); }
}
.mb-review-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
.mb-review-row { display: flex; align-items: flex-start; gap: 12px; &--block { flex-direction: column; } }
.mb-review-label { font-size: 11px; font-weight: 600; color: var(--mb-muted); text-transform: uppercase; letter-spacing: 0.3px; min-width: 110px; padding-top: 2px; }
.mb-review-value { font-size: 13px; color: var(--mb-text); word-break: break-word; }
.mb-review-link { color: var(--mb-accent); word-break: break-all; }
.mb-review-lines { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.mb-review-line {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px;
    background: var(--mb-card-bg);
    border-radius: $radius-xs;
    font-size: 12px;
}
.mb-review-line-num { font-weight: 700; color: var(--mb-muted); min-width: 18px; }
.mb-review-line-sku { font-family: monospace; font-size: 11px; color: var(--mb-text); font-weight: 500; }
.mb-review-line-detail { color: var(--mb-muted); font-size: 11px; }
.mb-review-line-remarks { color: $gray-500; font-size: 11px; font-style: italic; margin-left: auto; }

/* ═══════════ SUCCESS OVERLAY ═══════════ */
.mb-success-overlay {
    position: absolute; inset: 0;
    background: rgba(255,255,255,0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 60;
    backdrop-filter: blur(2px);
}
.mb-success-card {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    padding: 32px;
    background: var(--mb-form-bg);
    border-radius: var(--mb-radius);
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
}
.mb-success-icon { width: 48px; height: 48px; color: $green-600; }
.mb-success-text { font-size: 14px; font-weight: 600; color: var(--mb-text); margin: 0; }

/* ═══════════ TOAST ═══════════ */
.mb-toast {
    position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 12px; font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    z-index: 70;
    white-space: nowrap;
    &--info { background: $gray-900; color: #fff; }
    &--warning { background: $amber-500; color: #fff; }
    &--error { background: $red-500; color: #fff; }
}

/* ═══════════ TRANSITIONS ═══════════ */
.mb-dropdown-enter-active, .mb-dropdown-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.mb-dropdown-enter-from, .mb-dropdown-leave-to { opacity: 0; transform: translateY(-4px); }

.mb-review-expand-enter-active, .mb-review-expand-leave-active {
    transition: max-height 0.25s ease, opacity 0.2s ease;
    max-height: 500px;
    overflow: hidden;
}
.mb-review-expand-enter-from, .mb-review-expand-leave-to {
    max-height: 0;
    opacity: 0;
}

.mb-overlay-fade-enter-active, .mb-overlay-fade-leave-active { transition: opacity 0.3s ease; }
.mb-overlay-fade-enter-from, .mb-overlay-fade-leave-to { opacity: 0; }

.mb-toast-enter-active, .mb-toast-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.mb-toast-enter-from, .mb-toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
