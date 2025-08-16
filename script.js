class VehicleManager {
    constructor() {
        this.vehicles = this.loadVehicles();
        this.maintenance = this.loadMaintenance();
        this.vendors = this.loadVendors();
        this.currentVehicleId = null;
        this.currentMaintenanceId = null;
        this.currentVendorId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showPage('vehicleList');
        this.renderVehicles();
    }

    loadVehicles() {
        const stored = localStorage.getItem('amigo_vehicles');
        return stored ? JSON.parse(stored) : [];
    }

    saveVehicles() {
        localStorage.setItem('amigo_vehicles', JSON.stringify(this.vehicles));
    }

    loadMaintenance() {
        const stored = localStorage.getItem('amigo_maintenance');
        return stored ? JSON.parse(stored) : [];
    }

    saveMaintenance() {
        localStorage.setItem('amigo_maintenance', JSON.stringify(this.maintenance));
    }

    loadVendors() {
        const stored = localStorage.getItem('amigo_vendors');
        return stored ? JSON.parse(stored) : [];
    }

    saveVendors() {
        localStorage.setItem('amigo_vendors', JSON.stringify(this.vendors));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createVehicle(data) {
        const vehicle = {
            id: this.generateId(),
            name: data.name,
            type: data.type,
            make: data.make,
            model: data.model,
            year: data.year,
            tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.vehicles.push(vehicle);
        this.saveVehicles();
        return vehicle;
    }

    updateVehicle(id, data) {
        const index = this.vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
            this.vehicles[index] = {
                ...this.vehicles[index],
                name: data.name,
                type: data.type,
                make: data.make,
                model: data.model,
                year: data.year,
                tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                updatedAt: new Date().toISOString()
            };
            this.saveVehicles();
            return this.vehicles[index];
        }
        return null;
    }

    deleteVehicle(id) {
        const index = this.vehicles.findIndex(v => v.id === id);
        if (index !== -1) {
            this.vehicles.splice(index, 1);
            this.saveVehicles();
            return true;
        }
        return false;
    }

    getVehicle(id) {
        return this.vehicles.find(v => v.id === id);
    }

    createMaintenanceRecord(data) {
        const record = {
            id: this.generateId(),
            vehicleId: this.currentVehicleId,
            serviceType: data.serviceType === 'other' ? data.customService : data.serviceType,
            serviceDate: data.serviceDate,
            currentMileage: data.currentMileage ? parseInt(data.currentMileage) : null,
            vendorId: data.vendor || null,
            cost: data.cost ? parseFloat(data.cost) : null,
            notes: data.notes || '',
            nextServiceMileage: data.nextServiceMileage ? parseInt(data.nextServiceMileage) : null,
            nextServiceDate: data.nextServiceDate || null,
            createdAt: new Date().toISOString()
        };
        
        this.maintenance.push(record);
        this.saveMaintenance();
        return record;
    }

    updateMaintenanceRecord(id, data) {
        const index = this.maintenance.findIndex(m => m.id === id);
        if (index !== -1) {
            this.maintenance[index] = {
                ...this.maintenance[index],
                serviceType: data.serviceType === 'other' ? data.customService : data.serviceType,
                serviceDate: data.serviceDate,
                currentMileage: data.currentMileage ? parseInt(data.currentMileage) : null,
                vendorId: data.vendor || null,
                cost: data.cost ? parseFloat(data.cost) : null,
                notes: data.notes || '',
                nextServiceMileage: data.nextServiceMileage ? parseInt(data.nextServiceMileage) : null,
                nextServiceDate: data.nextServiceDate || null,
                updatedAt: new Date().toISOString()
            };
            this.saveMaintenance();
            return this.maintenance[index];
        }
        return null;
    }

    deleteMaintenanceRecord(id) {
        const index = this.maintenance.findIndex(m => m.id === id);
        if (index !== -1) {
            this.maintenance.splice(index, 1);
            this.saveMaintenance();
            return true;
        }
        return false;
    }

    getMaintenanceRecord(id) {
        return this.maintenance.find(m => m.id === id);
    }

    createVendor(data) {
        const vendor = {
            id: this.generateId(),
            name: data.name,
            location: data.location || '',
            phone: data.phone || '',
            email: data.email || '',
            notes: data.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.vendors.push(vendor);
        this.saveVendors();
        return vendor;
    }

    updateVendor(id, data) {
        const index = this.vendors.findIndex(v => v.id === id);
        if (index !== -1) {
            this.vendors[index] = {
                ...this.vendors[index],
                name: data.name,
                location: data.location || '',
                phone: data.phone || '',
                email: data.email || '',
                notes: data.notes || '',
                updatedAt: new Date().toISOString()
            };
            this.saveVendors();
            return this.vendors[index];
        }
        return null;
    }

    deleteVendor(id) {
        const index = this.vendors.findIndex(v => v.id === id);
        if (index !== -1) {
            this.vendors.splice(index, 1);
            this.saveVendors();
            return true;
        }
        return false;
    }

    getVendor(id) {
        return this.vendors.find(v => v.id === id);
    }

    getVehicleMaintenance(vehicleId) {
        return this.maintenance.filter(m => m.vehicleId === vehicleId)
            .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
    }

    getUpcomingServices(vehicleId = null) {
        const now = new Date();
        let records = this.maintenance;
        
        if (vehicleId) {
            records = records.filter(m => m.vehicleId === vehicleId);
        }
        
        return records.filter(m => {
            if (m.nextServiceDate) {
                const nextDate = new Date(m.nextServiceDate);
                return nextDate >= now;
            }
            return false;
        }).sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate));
    }

    getAllScheduledServices(vehicleId = null) {
        let records = this.maintenance;
        
        if (vehicleId && vehicleId !== 'all') {
            records = records.filter(m => m.vehicleId === vehicleId);
        }
        
        return records.filter(m => m.nextServiceDate)
            .sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate));
    }

    getOverdueServices(vehicleId = null) {
        const now = new Date();
        let records = this.maintenance;
        
        if (vehicleId && vehicleId !== 'all') {
            records = records.filter(m => m.vehicleId === vehicleId);
        }
        
        return records.filter(m => {
            if (m.nextServiceDate) {
                const nextDate = new Date(m.nextServiceDate);
                return nextDate < now;
            }
            return false;
        }).sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate));
    }

    getServicesThisMonth(vehicleId = null) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        let records = this.maintenance;
        
        if (vehicleId && vehicleId !== 'all') {
            records = records.filter(m => m.vehicleId === vehicleId);
        }
        
        return records.filter(m => {
            if (m.nextServiceDate) {
                const nextDate = new Date(m.nextServiceDate);
                return nextDate >= startOfMonth && nextDate <= endOfMonth;
            }
            return false;
        });
    }

    getNextUpcomingService(vehicleId) {
        const upcoming = this.getUpcomingServices(vehicleId);
        return upcoming.length > 0 ? upcoming[0] : null;
    }

    getVehicleIcon(type) {
        const icons = {
            car: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M9 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M20 8h-16l2-3h12l2 3z"/>
                <path d="M2 8h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z"/>
            </svg>`,
            van: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M9 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M2 6h18v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
                <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
            </svg>`,
            bus: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M9 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M3 4h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z"/>
                <path d="M3 8h18M7 4v4M17 4v4"/>
            </svg>`,
            motorcycle: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="5" cy="18" r="3"/>
                <circle cx="19" cy="18" r="3"/>
                <path d="M12 19V7a4 4 0 0 0-4-4H6"/>
                <path d="M16 8h3a4 4 0 0 1 0 8"/>
            </svg>`,
            bike: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="5.5" cy="17.5" r="3.5"/>
                <circle cx="18.5" cy="17.5" r="3.5"/>
                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V9l-3 3-4.5-4.5"/>
                <path d="M5.5 21V9h11.5"/>
            </svg>`,
            truck: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M9 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M1 6h14v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6z"/>
                <path d="M15 8h4l2 4v2a2 2 0 0 1-2 2h-1"/>
            </svg>`,
            other: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M9 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                <path d="M20 8h-16l2-3h12l2 3z"/>
                <path d="M2 8h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z"/>
            </svg>`
        };
        return icons[type] || icons['other'];
    }

    setupEventListeners() {
        const backBtn = document.getElementById('backBtn');
        const addVehicleBtn = document.getElementById('addVehicleBtn');
        const vehicleForm = document.getElementById('vehicleFormElement');
        const deleteBtn = document.getElementById('deleteBtn');
        const navItems = document.querySelectorAll('.nav-item');
        const expandBtn = document.getElementById('expandBtn');
        const editVehicleBtn = document.getElementById('editVehicleBtn');
        const addMaintenanceBtn = document.getElementById('addMaintenanceBtn');
        const maintenanceForm = document.getElementById('maintenanceFormElement');
        const serviceTypeSelect = document.getElementById('serviceType');
        const reminderExpandBtn = document.getElementById('reminderExpandBtn');
        const deleteMaintenanceBtn = document.getElementById('deleteMaintenanceBtn');
        const addVendorBtn = document.getElementById('addVendorBtn');
        const vendorForm = document.getElementById('vendorFormElement');
        const deleteVendorBtn = document.getElementById('deleteVendorBtn');
        const vendorSelect = document.getElementById('vendor');
        const vendorBottomSheet = document.getElementById('vendorBottomSheet');
        const vendorBottomSheetForm = document.getElementById('vendorBottomSheetForm');
        const closeBottomSheet = document.getElementById('closeBottomSheet');
        const cancelBottomSheet = document.getElementById('cancelBottomSheet');

        backBtn.addEventListener('click', () => {
            this.showPage('vehicleList');
        });

        addVehicleBtn.addEventListener('click', () => {
            this.showVehicleForm();
        });

        vehicleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        deleteBtn.addEventListener('click', () => {
            this.handleDeleteVehicle();
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.showPage(page);
                this.updateNavigation(page);
            });
        });

        expandBtn.addEventListener('click', () => {
            this.toggleExpandedFields();
        });

        editVehicleBtn.addEventListener('click', () => {
            this.showVehicleForm(this.currentVehicleId);
        });

        addMaintenanceBtn.addEventListener('click', () => {
            this.showMaintenanceForm();
        });

        maintenanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMaintenanceSubmit();
        });

        serviceTypeSelect.addEventListener('change', (e) => {
            const customGroup = document.getElementById('customServiceGroup');
            if (e.target.value === 'other') {
                customGroup.style.display = 'block';
            } else {
                customGroup.style.display = 'none';
            }
        });

        reminderExpandBtn.addEventListener('click', () => {
            this.toggleReminderFields();
        });

        deleteMaintenanceBtn.addEventListener('click', () => {
            this.handleDeleteMaintenance();
        });

        addVendorBtn.addEventListener('click', () => {
            this.showVendorForm();
        });

        vendorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleVendorSubmit();
        });

        deleteVendorBtn.addEventListener('click', () => {
            this.handleDeleteVendor();
        });

        vendorSelect.addEventListener('change', (e) => {
            if (e.target.value === 'add_new') {
                this.showVendorBottomSheet();
                e.target.value = ''; // Reset dropdown
            }
        });

        vendorBottomSheetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBottomSheetSubmit();
        });

        closeBottomSheet.addEventListener('click', () => {
            this.hideVendorBottomSheet();
        });

        cancelBottomSheet.addEventListener('click', () => {
            this.hideVendorBottomSheet();
        });

        vendorBottomSheet.addEventListener('click', (e) => {
            if (e.target === vendorBottomSheet) {
                this.hideVendorBottomSheet();
            }
        });
    }

    showPage(pageId) {
        const pages = document.querySelectorAll('.page');
        const backBtn = document.getElementById('backBtn');
        const pageTitle = document.getElementById('pageTitle');
        const addVehicleBtn = document.getElementById('addVehicleBtn');
        const addVendorBtn = document.getElementById('addVendorBtn');

        pages.forEach(page => page.classList.remove('active'));
        
        // Hide all FAB buttons first
        addVehicleBtn.style.display = 'none';
        addVendorBtn.style.display = 'none';
        
        if (pageId === 'vehicleList') {
            document.getElementById('vehicleList').classList.add('active');
            backBtn.style.display = 'none';
            pageTitle.textContent = 'Amigo';
            addVehicleBtn.style.display = 'block';
        } else if (pageId === 'vehicleForm') {
            document.getElementById('vehicleForm').classList.add('active');
            backBtn.style.display = 'block';
            pageTitle.textContent = this.currentVehicleId ? 'Edit Vehicle' : 'Add Vehicle';
        } else if (pageId === 'vehicleDetails') {
            document.getElementById('vehicleDetails').classList.add('active');
            backBtn.style.display = 'block';
            pageTitle.textContent = 'Vehicle Details';
        } else if (pageId === 'maintenanceForm') {
            document.getElementById('maintenanceForm').classList.add('active');
            backBtn.style.display = 'block';
            pageTitle.textContent = this.currentMaintenanceId ? 'Edit Maintenance' : 'Add Maintenance';
        } else if (pageId === 'maintenance') {
            document.getElementById('maintenancePage').classList.add('active');
            backBtn.style.display = 'none';
            pageTitle.textContent = 'Maintenance';
            this.renderMaintenancePage();
        } else if (pageId === 'schedule') {
            document.getElementById('schedulePage').classList.add('active');
            backBtn.style.display = 'none';
            pageTitle.textContent = 'Schedule';
            this.renderSchedulePage();
        } else if (pageId === 'vendors') {
            document.getElementById('vendorsPage').classList.add('active');
            backBtn.style.display = 'none';
            pageTitle.textContent = 'Vendors';
            addVendorBtn.style.display = 'block';
            this.renderVendorsPage();
        } else if (pageId === 'vendorForm') {
            document.getElementById('vendorForm').classList.add('active');
            backBtn.style.display = 'block';
            pageTitle.textContent = this.currentVendorId ? 'Edit Vendor' : 'Add Vendor';
        } else {
            document.getElementById('vehicleList').classList.add('active');
            backBtn.style.display = 'none';
            pageTitle.textContent = 'Amigo';
            addVehicleBtn.style.display = 'block';
        }
    }

    updateNavigation(activePageId) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.page === activePageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    toggleExpandedFields() {
        const expandedFields = document.getElementById('expandedFields');
        const expandIcon = document.querySelector('.expand-icon');
        
        if (expandedFields.style.display === 'none') {
            expandedFields.style.display = 'block';
            expandIcon.textContent = '▲';
        } else {
            expandedFields.style.display = 'none';
            expandIcon.textContent = '▼';
        }
    }

    showVehicleForm(vehicleId = null) {
        this.currentVehicleId = vehicleId;
        const form = document.getElementById('vehicleFormElement');
        const deleteBtn = document.getElementById('deleteBtn');
        const expandedFields = document.getElementById('expandedFields');
        const expandIcon = document.querySelector('.expand-icon');

        form.reset();
        expandedFields.style.display = 'none';
        expandIcon.textContent = '▼';

        if (vehicleId) {
            const vehicle = this.getVehicle(vehicleId);
            if (vehicle) {
                document.getElementById('vehicleName').value = vehicle.name;
                document.getElementById('vehicleType').value = vehicle.type;
                document.getElementById('vehicleMake').value = vehicle.make || '';
                document.getElementById('vehicleModel').value = vehicle.model || '';
                document.getElementById('vehicleYear').value = vehicle.year || '';
                document.getElementById('vehicleTags').value = vehicle.tags.join(', ');
                deleteBtn.style.display = 'block';
                
                if (vehicle.make || vehicle.model || vehicle.year || vehicle.tags.length > 0) {
                    expandedFields.style.display = 'block';
                    expandIcon.textContent = '▲';
                }
            }
        } else {
            deleteBtn.style.display = 'none';
        }

        this.showPage('vehicleForm');
    }

    handleFormSubmit() {
        const formData = new FormData(document.getElementById('vehicleFormElement'));
        const data = Object.fromEntries(formData.entries());

        if (this.currentVehicleId) {
            this.updateVehicle(this.currentVehicleId, data);
        } else {
            this.createVehicle(data);
        }

        this.renderVehicles();
        this.showPage('vehicleList');
    }

    handleDeleteVehicle() {
        if (this.currentVehicleId && confirm('Are you sure you want to delete this vehicle?')) {
            this.deleteVehicle(this.currentVehicleId);
            this.renderVehicles();
            this.showPage('vehicleList');
        }
    }

    renderVehicles() {
        const vehiclesGrid = document.getElementById('vehiclesGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.vehicles.length === 0) {
            vehiclesGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        vehiclesGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        vehiclesGrid.innerHTML = this.vehicles.map(vehicle => {
            const nextService = this.getNextUpcomingService(vehicle.id);
            const nextServiceText = nextService 
                ? `Next: ${this.formatServiceType(nextService.serviceType)} - ${this.formatDate(nextService.nextServiceDate)}`
                : 'No upcoming services';
            
            return `
                <div class="vehicle-card" data-id="${vehicle.id}">
                    <div class="vehicle-info">
                        <h3 class="vehicle-name">${vehicle.name}</h3>
                        <p class="vehicle-details">${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.year || ''}</p>
                        <p class="vehicle-next-service">${nextServiceText}</p>
                        <div class="vehicle-tags">
                            ${vehicle.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        vehiclesGrid.querySelectorAll('.vehicle-card').forEach(card => {
            card.addEventListener('click', () => {
                const vehicleId = card.dataset.id;
                this.showVehicleDetails(vehicleId);
            });
        });
    }

    showVehicleDetails(vehicleId) {
        this.currentVehicleId = vehicleId;
        const vehicle = this.getVehicle(vehicleId);
        
        if (!vehicle) return;

        document.querySelector('.vehicle-header-icon').innerHTML = this.getVehicleIcon(vehicle.type);
        document.getElementById('detailVehicleName').textContent = vehicle.name;
        document.getElementById('detailVehicleInfo').textContent = 
            `${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim();
        
        const tagsContainer = document.getElementById('detailVehicleTags');
        tagsContainer.innerHTML = vehicle.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');

        this.renderRecentMaintenance(vehicleId);
        this.renderUpcomingServices(vehicleId);
        this.showPage('vehicleDetails');
    }

    showMaintenanceForm(maintenanceId = null) {
        this.currentMaintenanceId = maintenanceId;
        const form = document.getElementById('maintenanceFormElement');
        const deleteBtn = document.getElementById('deleteMaintenanceBtn');
        
        form.reset();
        this.populateVendorSelect();
        
        if (maintenanceId) {
            const record = this.getMaintenanceRecord(maintenanceId);
            if (record) {
                document.getElementById('serviceType').value = record.serviceType;
                document.getElementById('serviceDate').value = record.serviceDate;
                document.getElementById('currentMileage').value = record.currentMileage || '';
                document.getElementById('vendor').value = record.vendorId || '';
                document.getElementById('cost').value = record.cost || '';
                document.getElementById('notes').value = record.notes || '';
                document.getElementById('nextServiceMileage').value = record.nextServiceMileage || '';
                document.getElementById('nextServiceDate').value = record.nextServiceDate || '';
                
                // Handle custom service type
                if (!['oil_change', 'tire_rotation', 'brake_service', 'wheel_alignment', 'transmission_service', 'coolant_flush', 'air_filter', 'spark_plugs', 'battery_service', 'inspection'].includes(record.serviceType)) {
                    document.getElementById('serviceType').value = 'other';
                    document.getElementById('customService').value = record.serviceType;
                    document.getElementById('customServiceGroup').style.display = 'block';
                }
                
                // Show reminder fields if there's next service data
                if (record.nextServiceMileage || record.nextServiceDate) {
                    document.getElementById('reminderFields').style.display = 'block';
                    document.querySelector('#reminderExpandBtn .expand-icon').textContent = '▲';
                } else {
                    document.getElementById('reminderFields').style.display = 'none';
                    document.querySelector('#reminderExpandBtn .expand-icon').textContent = '▼';
                }
                
                deleteBtn.style.display = 'block';
            }
        } else {
            document.getElementById('serviceDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('customServiceGroup').style.display = 'none';
            document.getElementById('reminderFields').style.display = 'none';
            document.querySelector('#reminderExpandBtn .expand-icon').textContent = '▼';
            deleteBtn.style.display = 'none';
        }
        
        this.showPage('maintenanceForm');
    }

    toggleReminderFields() {
        const reminderFields = document.getElementById('reminderFields');
        const expandIcon = document.querySelector('#reminderExpandBtn .expand-icon');
        
        if (reminderFields.style.display === 'none') {
            reminderFields.style.display = 'block';
            expandIcon.textContent = '▲';
        } else {
            reminderFields.style.display = 'none';
            expandIcon.textContent = '▼';
        }
    }

    handleMaintenanceSubmit() {
        const formData = new FormData(document.getElementById('maintenanceFormElement'));
        const data = Object.fromEntries(formData.entries());

        if (this.currentMaintenanceId) {
            this.updateMaintenanceRecord(this.currentMaintenanceId, data);
        } else {
            this.createMaintenanceRecord(data);
        }
        
        this.showVehicleDetails(this.currentVehicleId);
    }

    handleDeleteMaintenance() {
        if (this.currentMaintenanceId && confirm('Are you sure you want to delete this maintenance record?')) {
            this.deleteMaintenanceRecord(this.currentMaintenanceId);
            this.showVehicleDetails(this.currentVehicleId);
        }
    }

    renderRecentMaintenance(vehicleId) {
        const container = document.getElementById('recentMaintenance');
        const maintenance = this.getVehicleMaintenance(vehicleId).slice(0, 5);

        if (maintenance.length === 0) {
            container.innerHTML = '<p class="empty-text">No maintenance records yet</p>';
            return;
        }

        container.innerHTML = maintenance.map(record => {
            const vendor = record.vendorId ? this.getVendor(record.vendorId) : null;
            return `
                <div class="maintenance-item">
                    <div class="maintenance-info">
                        <h4>${this.formatServiceType(record.serviceType)}</h4>
                        <p class="maintenance-date">${this.formatDate(record.serviceDate)}</p>
                        ${vendor ? `<p class="maintenance-vendor">@ ${vendor.name}</p>` : ''}
                        ${record.currentMileage ? `<p class="maintenance-mileage">${record.currentMileage.toLocaleString()} km</p>` : ''}
                        ${record.cost ? `<p class="maintenance-cost">$${record.cost.toFixed(2)}</p>` : ''}
                    </div>
                    <button class="maintenance-edit-btn" data-id="${record.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        // Add event listeners for edit buttons
        container.querySelectorAll('.maintenance-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const maintenanceId = btn.dataset.id;
                this.showMaintenanceForm(maintenanceId);
            });
        });
    }

    renderUpcomingServices(vehicleId) {
        const container = document.getElementById('upcomingServices');
        const upcoming = this.getUpcomingServices(vehicleId);

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="empty-text">No upcoming services scheduled</p>';
            return;
        }

        container.innerHTML = upcoming.map(record => `
            <div class="upcoming-item">
                <div class="upcoming-info">
                    <h4>${this.formatServiceType(record.serviceType)}</h4>
                    <p class="upcoming-date">Due: ${this.formatDate(record.nextServiceDate)}</p>
                    ${record.nextServiceMileage ? `<p class="upcoming-mileage">At ${record.nextServiceMileage.toLocaleString()} km</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderMaintenancePage() {
        const container = document.getElementById('allMaintenance');
        const emptyState = document.getElementById('maintenanceEmptyState');
        const vehicleFilter = document.getElementById('vehicleFilter');

        vehicleFilter.innerHTML = '<option value="all">All Vehicles</option>' +
            this.vehicles.map(v => `<option value="${v.id}">${v.name}</option>`).join('');

        const selectedVehicleId = vehicleFilter.value;
        let maintenance = selectedVehicleId === 'all' ? 
            this.maintenance : this.maintenance.filter(m => m.vehicleId === selectedVehicleId);

        maintenance = maintenance.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));

        if (maintenance.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';

        container.innerHTML = maintenance.map(record => {
            const vehicle = this.getVehicle(record.vehicleId);
            const vendor = record.vendorId ? this.getVendor(record.vendorId) : null;
            return `
                <div class="maintenance-item">
                    <div class="maintenance-info">
                        <h4>${this.formatServiceType(record.serviceType)}</h4>
                        <p class="maintenance-vehicle">${vehicle ? vehicle.name : 'Unknown Vehicle'}</p>
                        <p class="maintenance-date">${this.formatDate(record.serviceDate)}</p>
                        ${vendor ? `<p class="maintenance-vendor">@ ${vendor.name}</p>` : ''}
                        ${record.currentMileage ? `<p class="maintenance-mileage">${record.currentMileage.toLocaleString()} km</p>` : ''}
                        ${record.cost ? `<p class="maintenance-cost">$${record.cost.toFixed(2)}</p>` : ''}
                        ${record.notes ? `<p class="maintenance-notes">${record.notes}</p>` : ''}
                    </div>
                    <button class="maintenance-edit-btn" data-id="${record.id}" data-vehicle-id="${record.vehicleId}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        // Add event listeners for edit buttons
        container.querySelectorAll('.maintenance-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const maintenanceId = btn.dataset.id;
                const vehicleId = btn.dataset.vehicleId;
                this.currentVehicleId = vehicleId; // Set the vehicle context for editing
                this.showMaintenanceForm(maintenanceId);
            });
        });

        vehicleFilter.addEventListener('change', () => this.renderMaintenancePage());
    }

    renderSchedulePage() {
        const scheduleVehicleFilter = document.getElementById('scheduleVehicleFilter');
        const scheduleList = document.getElementById('scheduleList');
        const emptyState = document.getElementById('scheduleEmptyState');

        // Populate vehicle filter
        scheduleVehicleFilter.innerHTML = '<option value="all">All Vehicles</option>' +
            this.vehicles.map(v => `<option value="${v.id}">${v.name}</option>`).join('');

        const selectedVehicleId = scheduleVehicleFilter.value;
        
        // Update summary cards
        this.updateScheduleSummary(selectedVehicleId);
        
        // Get all scheduled services grouped by date
        const scheduledServices = this.getAllScheduledServices(selectedVehicleId);
        const overdueServices = this.getOverdueServices(selectedVehicleId);
        
        if (scheduledServices.length === 0 && overdueServices.length === 0) {
            scheduleList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        scheduleList.style.display = 'block';
        emptyState.style.display = 'none';

        // Group services by date
        const groupedServices = this.groupServicesByDate([...overdueServices, ...scheduledServices]);
        
        scheduleList.innerHTML = Object.entries(groupedServices).map(([dateKey, services]) => {
            const isOverdue = new Date(dateKey) < new Date();
            const dateLabel = this.formatScheduleDate(dateKey, isOverdue);
            
            return `
                <div class="schedule-date-group">
                    <div class="schedule-date-header ${isOverdue ? 'overdue' : ''}">
                        <h3>${dateLabel}</h3>
                        <span class="service-count">${services.length} service${services.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="schedule-services">
                        ${services.map(service => this.renderScheduleService(service, isOverdue)).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for edit buttons
        scheduleList.querySelectorAll('.maintenance-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const maintenanceId = btn.dataset.id;
                const vehicleId = btn.dataset.vehicleId;
                this.currentVehicleId = vehicleId;
                this.showMaintenanceForm(maintenanceId);
            });
        });

        scheduleVehicleFilter.addEventListener('change', () => this.renderSchedulePage());
    }

    groupServicesByDate(services) {
        const grouped = {};
        
        services.forEach(service => {
            const dateKey = service.nextServiceDate;
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(service);
        });
        
        return grouped;
    }

    renderScheduleService(service, isOverdue) {
        const vehicle = this.getVehicle(service.vehicleId);
        const statusClass = isOverdue ? 'schedule-service overdue' : 'schedule-service';
        
        return `
            <div class="${statusClass}">
                <div class="service-info">
                    <div class="service-main">
                        <h4>${this.formatServiceType(service.serviceType)}</h4>
                        <p class="service-vehicle">${vehicle ? vehicle.name : 'Unknown Vehicle'}</p>
                    </div>
                    <div class="service-details">
                        ${service.nextServiceMileage ? `<p class="service-mileage">At ${service.nextServiceMileage.toLocaleString()} km</p>` : ''}
                        <p class="service-last">Last: ${this.formatDate(service.serviceDate)}</p>
                    </div>
                </div>
                <button class="maintenance-edit-btn" data-id="${service.id}" data-vehicle-id="${service.vehicleId}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                </button>
            </div>
        `;
    }

    updateScheduleSummary(vehicleId) {
        const overdueCount = this.getOverdueServices(vehicleId).length;
        const thisMonthCount = this.getServicesThisMonth(vehicleId).length;
        const totalScheduled = this.getAllScheduledServices(vehicleId).length;

        document.getElementById('overdueCount').textContent = overdueCount;
        document.getElementById('upcomingCount').textContent = thisMonthCount;
        document.getElementById('totalScheduled').textContent = totalScheduled;
    }

    formatScheduleDate(dateString, isOverdue) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();
        
        if (isOverdue) {
            const daysOverdue = Math.floor((today - date) / (1000 * 60 * 60 * 24));
            if (daysOverdue === 0) return 'Overdue Today';
            return `Overdue ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
        }
        
        if (isToday) return 'Today';
        if (isTomorrow) return 'Tomorrow';
        
        const daysFromNow = Math.floor((date - today) / (1000 * 60 * 60 * 24));
        if (daysFromNow <= 7) {
            return `In ${daysFromNow} day${daysFromNow !== 1 ? 's' : ''}`;
        }
        
        return this.formatDate(dateString);
    }

    populateVendorSelect() {
        const vendorSelect = document.getElementById('vendor');
        vendorSelect.innerHTML = '<option value="">Select vendor</option>' +
            this.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('') +
            '<option value="add_new" style="color: #007bff; font-weight: 500;">+ Add New Vendor</option>';
    }

    showVendorForm(vendorId = null) {
        this.currentVendorId = vendorId;
        const form = document.getElementById('vendorFormElement');
        const deleteBtn = document.getElementById('deleteVendorBtn');

        form.reset();

        if (vendorId) {
            const vendor = this.getVendor(vendorId);
            if (vendor) {
                document.getElementById('vendorName').value = vendor.name;
                document.getElementById('vendorLocation').value = vendor.location || '';
                document.getElementById('vendorPhone').value = vendor.phone || '';
                document.getElementById('vendorEmail').value = vendor.email || '';
                document.getElementById('vendorNotes').value = vendor.notes || '';
                deleteBtn.style.display = 'block';
            }
        } else {
            deleteBtn.style.display = 'none';
        }

        this.showPage('vendorForm');
    }

    handleVendorSubmit() {
        const formData = new FormData(document.getElementById('vendorFormElement'));
        const data = Object.fromEntries(formData.entries());

        if (this.currentVendorId) {
            this.updateVendor(this.currentVendorId, data);
        } else {
            this.createVendor(data);
        }

        this.renderVendorsPage();
        this.showPage('vendors');
    }

    handleDeleteVendor() {
        if (this.currentVendorId && confirm('Are you sure you want to delete this vendor?')) {
            this.deleteVendor(this.currentVendorId);
            this.renderVendorsPage();
            this.showPage('vendors');
        }
    }

    renderVendorsPage() {
        const vendorsList = document.getElementById('vendorsList');
        const emptyState = document.getElementById('vendorsEmptyState');

        if (this.vendors.length === 0) {
            vendorsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        vendorsList.style.display = 'block';
        emptyState.style.display = 'none';

        vendorsList.innerHTML = this.vendors.map(vendor => `
            <div class="vendor-card" data-id="${vendor.id}">
                <div class="vendor-info">
                    <h3 class="vendor-name">${vendor.name}</h3>
                    ${vendor.location ? `<p class="vendor-location">${vendor.location}</p>` : ''}
                    ${vendor.phone ? `<p class="vendor-phone">${vendor.phone}</p>` : ''}
                    ${vendor.email ? `<p class="vendor-email">${vendor.email}</p>` : ''}
                    ${vendor.notes ? `<p class="vendor-notes">${vendor.notes}</p>` : ''}
                </div>
                <button class="vendor-edit-btn" data-id="${vendor.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                </button>
            </div>
        `).join('');

        vendorsList.querySelectorAll('.vendor-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const vendorId = btn.dataset.id;
                this.showVendorForm(vendorId);
            });
        });
    }

    showVendorBottomSheet() {
        const bottomSheet = document.getElementById('vendorBottomSheet');
        const form = document.getElementById('vendorBottomSheetForm');
        
        form.reset();
        bottomSheet.classList.add('show');
        
        // Focus on the first input
        setTimeout(() => {
            document.getElementById('bottomSheetVendorName').focus();
        }, 300);
    }

    hideVendorBottomSheet() {
        const bottomSheet = document.getElementById('vendorBottomSheet');
        bottomSheet.classList.remove('show');
    }

    handleBottomSheetSubmit() {
        const formData = new FormData(document.getElementById('vendorBottomSheetForm'));
        const data = Object.fromEntries(formData.entries());

        const newVendor = this.createVendor(data);
        this.populateVendorSelect();
        
        // Select the newly created vendor
        document.getElementById('vendor').value = newVendor.id;
        
        this.hideVendorBottomSheet();
    }

    formatServiceType(type) {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VehicleManager();
});