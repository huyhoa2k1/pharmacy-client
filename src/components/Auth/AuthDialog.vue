<template>
    <a-modal v-model:open="isOpen" :title="null" :footer="null" :closable="true" :width="500" class="auth-modal"
        @cancel="closeModal">
        <div class="auth-dialog">
            <!-- Header -->
            <div class="auth-header">
                <h1 class="auth-title">Nhà Thuốc Online</h1>
                <p class="auth-subtitle">Chào mừng bạn đến với hệ thống bán hàng</p>
            </div>

            <!-- Tabs Toggle -->
            <div class="grid grid-cols-2 gap-3 mb-6">
                <button
                    :class="['auth-tab', { 'auth-tab-active': isLogin }]"
                    @click="isLogin = true">
                    <i class="pi pi-sign-in mr-2"></i>
                    Đăng Nhập
                </button>
                <button
                    :class="['auth-tab', { 'auth-tab-active': !isLogin }]"
                    @click="isLogin = false">
                    <i class="pi pi-user-plus mr-2"></i>
                    Đăng Ký
                </button>
            </div>

            <!-- Login Form -->
            <form v-show="isLogin" @submit.prevent="handleLogin" class="animate-fadeIn">
                <div class="mb-4">
                    <label class="auth-label">
                        Số Điện Thoại <span class="auth-required">*</span>
                    </label>
                    <a-input v-model:value="loginForm.phone" placeholder="Nhập số điện thoại" size="large" allow-clear
                        :status="loginErrors.phone ? 'error' : ''" />
                    <span v-if="loginErrors.phone" class="auth-error">{{ loginErrors.phone
                        }}</span>
                </div>

                <div class="mb-6">
                    <label class="auth-label">
                        Mật Khẩu <span class="auth-required">*</span>
                    </label>
                    <a-input-password v-model:value="loginForm.password" placeholder="Nhập mật khẩu" size="large"
                        :status="loginErrors.password ? 'error' : ''" />
                    <span v-if="loginErrors.password" class="auth-error">{{ loginErrors.password
                        }}</span>
                </div>

                <a-button type="primary" block size="large" html-type="submit" :loading="isLoginSubmitting"
                    class="auth-submit">
                    Đăng Nhập
                </a-button>

                <div class="text-center">
                    <a-button type="link" class="auth-link">
                        Quên mật khẩu?
                    </a-button>
                </div>
            </form>

            <!-- Register Form -->
            <form v-show="!isLogin" @submit.prevent="handleRegister" class="animate-fadeIn">
                <div class="mb-4">
                    <label class="auth-label">
                        Email <span class="auth-required">*</span>
                    </label>
                    <a-input v-model:value="registerForm.email" type="email" placeholder="Nhập email" size="large"
                        allow-clear :status="registerErrors.email ? 'error' : ''" />
                    <span v-if="registerErrors.email" class="auth-error">{{ registerErrors.email
                        }}</span>
                </div>

                <div class="mb-4">
                    <label class="auth-label">
                        Số Điện Thoại <span class="auth-required">*</span>
                    </label>
                    <a-input v-model:value="registerForm.phone" placeholder="Nhập số điện thoại" size="large"
                        allow-clear :status="registerErrors.phone ? 'error' : ''" />
                    <span v-if="registerErrors.phone" class="auth-error">{{ registerErrors.phone
                        }}</span>
                </div>

                <div class="mb-6">
                    <label class="auth-label">
                        Mật Khẩu <span class="auth-required">*</span>
                    </label>
                    <a-input-password v-model:value="registerForm.password" placeholder="Nhập mật khẩu" size="large"
                        :status="registerErrors.password ? 'error' : ''" />
                    <span v-if="registerErrors.password" class="auth-error">{{
                        registerErrors.password }}</span>
                </div>

                <a-button type="primary" block size="large" html-type="submit" :loading="isRegisterSubmitting"
                    class="auth-submit">
                    Đăng Ký
                </a-button>

                <div class="text-center">
                    <span class="auth-terms">
                        Bằng cách đăng ký, bạn đồng ý với
                        <a-button type="link" class="auth-link">
                            Điều khoản dịch vụ
                        </a-button>
                    </span>
                </div>
            </form>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { AuthService } from '@/api/services/auth';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// Modal state
const isOpen = ref(false);
const isLogin = ref(true);

// Login form
const loginForm = ref({
    phone: '',
    password: ''
});

const loginErrors = ref({
    phone: '',
    password: ''
});

const isLoginSubmitting = ref(false);

// Register form
const registerForm = ref({
    email: '',
    phone: '',
    password: ''
});

const registerErrors = ref({
    email: '',
    phone: '',
    password: ''
});

const isRegisterSubmitting = ref(false);

// Validation functions
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    return phoneRegex.test(phone);
};

const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
};

// Login validation
const validateLogin = (): boolean => {
    loginErrors.value = {
        phone: '',
        password: ''
    };

    if (!loginForm.value.phone?.trim()) {
        loginErrors.value.phone = 'Vui lòng nhập số điện thoại';
    } else if (!isValidPhone(loginForm.value.phone)) {
        loginErrors.value.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }

    if (!loginForm.value.password?.trim()) {
        loginErrors.value.password = 'Vui lòng nhập mật khẩu';
    } else if (!isValidPassword(loginForm.value.password)) {
        loginErrors.value.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    return Object.values(loginErrors.value).every(err => !err);
};

// Register validation
const validateRegister = (): boolean => {
    registerErrors.value = {
        email: '',
        phone: '',
        password: ''
    };

    if (!registerForm.value.email?.trim()) {
        registerErrors.value.email = 'Vui lòng nhập email';
    } else if (!isValidEmail(registerForm.value.email)) {
        registerErrors.value.email = 'Email không hợp lệ (VD: example@mail.com)';
    }

    if (!registerForm.value.phone?.trim()) {
        registerErrors.value.phone = 'Vui lòng nhập số điện thoại';
    } else if (!isValidPhone(registerForm.value.phone)) {
        registerErrors.value.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }

    if (!registerForm.value.password?.trim()) {
        registerErrors.value.password = 'Vui lòng nhập mật khẩu';
    } else if (!isValidPassword(registerForm.value.password)) {
        registerErrors.value.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    return Object.values(registerErrors.value).every(err => !err);
};

// Handle login
const handleLogin = async () => {
    if (!validateLogin()) {
        return;
    }

    isLoginSubmitting.value = true;

    try {
        const data = await AuthService.login({
            phone: loginForm.value.phone,
            password: loginForm.value.password
        });

        userStore.setUser(data.user);

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('pharmacy_user', JSON.stringify({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            phone: data.user.phone,
            role: data.user.role,
        }));
        message.success('Đăng nhập thành công!');

        closeModal();

        loginForm.value = { phone: '', password: '' };
    } catch {
        message.error('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
        isLoginSubmitting.value = false;
    }
};

// Handle register
const handleRegister = async () => {
    if (!validateRegister()) {
        return;
    }

    isRegisterSubmitting.value = true;

    try {
        await AuthService.register({
            email: registerForm.value.email,
            phone: registerForm.value.phone,
            password: registerForm.value.password
        });

        message.success('Đăng ký thành công!');

        isLogin.value = true;

        // Reset form
        registerForm.value = { email: '', phone: '', password: '' };
    } catch {
        message.error('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
        isRegisterSubmitting.value = false;
    }
};

// Open modal
const openModal = () => {
    isOpen.value = true;
    isLogin.value = true;
};

// Close modal
const closeModal = () => {
    isOpen.value = false;
};

// Export functions
defineExpose({
    openModal,
    closeModal
});
</script>

<style scoped>
.auth-modal :deep(.ant-modal-content) {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 0;
    box-shadow: var(--shadow-xl);
}

.auth-modal :deep(.ant-modal-header) {
    border-bottom: none;
    padding: 0;
}

.auth-modal :deep(.ant-modal-close) {
    top: 16px;
    right: 16px;
    border-radius: 50%;
    color: var(--color-muted-foreground);
    transition: color var(--transition-base), background-color var(--transition-base);
}

.auth-modal :deep(.ant-modal-close:hover) {
    color: var(--color-foreground);
    background: var(--color-muted);
}

.auth-dialog {
    padding: var(--space-lg);
}

.auth-header {
    margin-bottom: var(--space-xl);
    text-align: center;
}

.auth-title {
    margin: 0 0 var(--space-xs);
    color: var(--color-foreground);
    font-family: Figtree, Arial, sans-serif;
    font-size: 1.875rem;
    font-weight: 700;
}

.auth-subtitle,
.auth-terms {
    color: var(--color-muted-foreground);
    font-size: 0.875rem;
}

.auth-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: var(--color-muted);
    color: var(--color-muted-foreground);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: color var(--transition-base), background-color var(--transition-base),
        border-color var(--transition-base), box-shadow var(--transition-base);
}

.auth-tab:hover {
    border-color: var(--color-border);
    color: var(--color-foreground);
}

.auth-tab-active {
    background: var(--color-primary);
    color: var(--color-on-primary);
    box-shadow: var(--shadow-sm);
}

.auth-tab:focus-visible,
.auth-link:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--color-ring) 35%, transparent);
    outline-offset: 2px;
}

.auth-label {
    display: block;
    margin-bottom: var(--space-sm);
    color: var(--color-foreground);
    font-size: 0.875rem;
    font-weight: 600;
}

.auth-required,
.auth-error {
    color: var(--color-destructive);
}

.auth-error {
    display: block;
    margin-top: var(--space-xs);
    font-size: 0.75rem;
}

.auth-submit {
    margin-bottom: var(--space-md);
    border-color: var(--color-accent) !important;
    background: var(--color-accent) !important;
    color: var(--color-on-accent) !important;
    font-weight: 600;
    cursor: pointer;
}

.auth-submit:hover {
    border-color: color-mix(in srgb, var(--color-accent) 90%, #000000) !important;
    background: color-mix(in srgb, var(--color-accent) 90%, #000000) !important;
}

.auth-link {
    height: auto;
    padding: 0;
    color: var(--color-primary) !important;
    font-size: 0.75rem;
    cursor: pointer;
}

.auth-link:hover {
    color: var(--color-foreground) !important;
}

/* Form animation */
.animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Ant Design input styling */
:deep(.ant-input),
:deep(.ant-input-password input) {
    border-color: var(--color-border) !important;
    border-radius: var(--radius-sm) !important;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

:deep(.ant-input:hover),
:deep(.ant-input-password input:hover) {
    border-color: var(--color-primary) !important;
}

:deep(.ant-input:focus),
:deep(.ant-input-password input:focus) {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ring) 20%, transparent) !important;
}

:deep(.ant-input-status-error),
:deep(.ant-input-password.ant-input-status-error input) {
    border-color: var(--color-destructive) !important;
}

@media (prefers-reduced-motion: reduce) {
    .auth-modal :deep(.ant-modal-close),
    .auth-tab,
    :deep(.ant-input),
    :deep(.ant-input-password input) {
        transition: none;
    }

    .animate-fadeIn {
        animation: none;
    }
}
</style>
