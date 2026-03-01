export default {
    editor: {
        label: { en: 'Mockup Booking' },
        icon: 'document',
        customSettingsPropertiesOrder: [
            {
                label: 'Data Sources',
                isCollapsible: true,
                properties: [
                    'teammatesData',
                    'inventoryData',
                ],
            },
            {
                label: 'Dropdown Options',
                isCollapsible: true,
                properties: ['customizationOptions'],
            },
            {
                label: 'Editing Context',
                isCollapsible: true,
                properties: ['editingData', 'actionStatus'],
            },
        ],
        customStylePropertiesOrder: [
            {
                label: 'Colors',
                isCollapsible: true,
                properties: [
                    'formBgColor',
                    'cardBgColor',
                    'borderColor',
                    'accentColor',
                    'accentHoverColor',
                    'urgentColor',
                    'textColor',
                    'mutedTextColor',
                ],
            },
            {
                label: 'Shape',
                isCollapsible: true,
                properties: ['borderRadius'],
            },
            {
                label: 'Buttons',
                isCollapsible: true,
                properties: [
                    'btnBgColor',
                    'btnTextColor',
                    'btnHoverColor',
                    'btnRadius',
                ],
            },
            {
                label: 'Typography',
                isCollapsible: true,
                properties: ['fontFamily', 'fontSize'],
            },
        ],
    },
    triggerEvents: [
        {
            name: 'onAction',
            label: { en: 'On Action' },
            event: {
                value: {
                    action: '',
                    id: null,
                    created_at: '',
                    updated_at: '',
                    title: '',
                    type: '',
                    pic_id: '',
                    mockup_details: [],
                    mockup_folder: '',
                    history: [],
                    client: '',
                    user_deadline: '',
                },
            },
            default: true,
        },
    ],
    properties: {
        teammatesData: {
            label: { en: 'Teammates Data' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of teammates: { id, name, mastername, type, email, phone }',
            },
            /* wwEditor:end */
        },
        inventoryData: {
            label: { en: 'Inventory / SKU Reference Data' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of inventory_data: { sku, type, model, color, size, tags, snt, imagelink }',
            },
            /* wwEditor:end */
        },
        customizationOptions: {
            label: { en: 'Customization Options' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [
                { label: 'None', value: 'None' },
                { label: 'UV 1 Logo', value: 'UV 1 Logo' },
                { label: 'UV 2 Logos', value: 'UV 2 Logos' },
                { label: 'UV 360', value: 'UV 360' },
                { label: 'Laser Engraving', value: 'Laser Engraving' },
            ],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of { label, value } for customization type dropdown.',
            },
            /* wwEditor:end */
        },
        editingData: {
            label: { en: 'Editing Data (Existing Request)' },
            type: 'Object',
            section: 'settings',
            bindable: true,
            defaultValue: null,
            /* wwEditor:start */
            bindingValidation: {
                type: 'object',
                tooltip: 'Existing mockup_requests row for edit mode. null = create mode. Shape: { id, created_at, title, type, pic_id, mockup_details, mockup_folder, history, client, user_deadline }',
            },
            /* wwEditor:end */
        },
        actionStatus: {
            label: { en: 'Action Status' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Set to "successful" or "failed" after submission. Empty = idle.',
            },
            /* wwEditor:end */
        },

        formBgColor: { label: { en: 'Form background' }, type: 'Color', section: 'style', defaultValue: '#ffffff' },
        cardBgColor: { label: { en: 'Card / section background' }, type: 'Color', section: 'style', defaultValue: '#f9fafb' },
        borderColor: { label: { en: 'Border color' }, type: 'Color', section: 'style', defaultValue: '#e5e7eb' },
        accentColor: { label: { en: 'Accent color' }, type: 'Color', section: 'style', defaultValue: '#3b82f6' },
        accentHoverColor: { label: { en: 'Accent hover' }, type: 'Color', section: 'style', defaultValue: '#2563eb' },
        urgentColor: { label: { en: 'Urgent tag color' }, type: 'Color', section: 'style', defaultValue: '#ef4444' },
        textColor: { label: { en: 'Text color' }, type: 'Color', section: 'style', defaultValue: '#111827' },
        mutedTextColor: { label: { en: 'Muted text color' }, type: 'Color', section: 'style', defaultValue: '#6b7280' },
        btnBgColor: { label: { en: 'Button background' }, type: 'Color', section: 'style', defaultValue: '#111827' },
        btnTextColor: { label: { en: 'Button text' }, type: 'Color', section: 'style', defaultValue: '#ffffff' },
        btnHoverColor: { label: { en: 'Button hover' }, type: 'Color', section: 'style', defaultValue: '#1f2937' },
        btnRadius: {
            label: { en: 'Button radius' },
            type: 'Text',
            section: 'style',
            defaultValue: '6px',
            options: { placeholder: '6px' },
        },
        borderRadius: {
            label: { en: 'Border radius' },
            type: 'Text',
            section: 'style',
            defaultValue: '10px',
            options: { placeholder: '10px' },
        },
        fontFamily: {
            label: { en: 'Font family' },
            type: 'FontFamily',
            section: 'style',
            defaultValue: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        fontSize: {
            label: { en: 'Base font size' },
            type: 'Length',
            section: 'style',
            responsive: true,
            defaultValue: '13px',
            options: { unitChoices: [{ value: 'px', label: 'px', min: 10, max: 20 }] },
        },
    },
};
