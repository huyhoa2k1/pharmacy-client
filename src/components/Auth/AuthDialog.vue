<template>
    <a-modal v-model:open="isOpen" :title="null" :footer="null" :closable="true" :width="500" class="auth-modal"
        @cancel="closeModal">
        <div class="py-6">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="auth-title-gradient text-3xl font-bold mb-2">Nhà Thuốc Online</h1>
                <p class="text-sm text-gray-500">Chào mừng bạn đến với hệ thống bán hàng</p>
            </div>

            <!-- Tabs Toggle -->
            <div class="grid grid-cols-2 gap-3 mb-6">
                <button
                    :class="['px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center',
                        isLogin ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
                    @click="isLogin = true">
                    <i class="pi pi-sign-in mr-2"></i>
                    Đăng Nhập
                </button>
                <button
                    :class="['px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center',
                        !isLogin ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
                    @click="isLogin = false">
                    <i class="pi pi-user-plus mr-2"></i>
                    Đăng Ký
                </button>
            </div>

            <!-- Login Form -->
            <form v-show="isLogin" @submit.prevent="handleLogin" class="animate-fadeIn">
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Số Điện Thoại <span class="text-red-500">*</span>
                    </label>
                    <a-input v-model:value="loginForm.phone" placeholder="Nhập số điện thoại" size="large" allow-clear
                        :status="loginErrors.phone ? 'error' : ''" />
                    <span v-if="loginErrors.phone" class="text-xs text-red-500 mt-1 block">{{ loginErrors.phone
                        }}</span>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Mật Khẩu <span class="text-red-500">*</span>
                    </label>
                    <a-input-password v-model:value="loginForm.password" placeholder="Nhập mật khẩu" size="large"
                        :status="loginErrors.password ? 'error' : ''" />
                    <span v-if="loginErrors.password" class="text-xs text-red-500 mt-1 block">{{ loginErrors.password
                        }}</span>
                </div>

                <a-button type="primary" block size="large" html-type="submit" :loading="isLoginSubmitting"
                    class="!bg-gradient-to-r from-purple-500 to-purple-600 !border-0 !font-semibold mb-4">
                    Đăng Nhập
                </a-button>

                <div class="text-center">
                    <a-button type="link" class="!text-purple-600 !p-0 !h-auto text-xs hover:!text-purple-700">
                        Quên mật khẩu?
                    </a-button>
                </div>
            </form>

            <!-- Register Form -->
            <form v-show="!isLogin" @submit.prevent="handleRegister" class="animate-fadeIn">
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span class="text-red-500">*</span>
                    </label>
                    <a-input v-model:value="registerForm.email" type="email" placeholder="Nhập email" size="large"
                        allow-clear :status="registerErrors.email ? 'error' : ''" />
                    <span v-if="registerErrors.email" class="text-xs text-red-500 mt-1 block">{{ registerErrors.email
                        }}</span>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Số Điện Thoại <span class="text-red-500">*</span>
                    </label>
                    <a-input v-model:value="registerForm.phone" placeholder="Nhập số điện thoại" size="large"
                        allow-clear :status="registerErrors.phone ? 'error' : ''" />
                    <span v-if="registerErrors.phone" class="text-xs text-red-500 mt-1 block">{{ registerErrors.phone
                        }}</span>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Mật Khẩu <span class="text-red-500">*</span>
                    </label>
                    <a-input-password v-model:value="registerForm.password" placeholder="Nhập mật khẩu" size="large"
                        :status="registerErrors.password ? 'error' : ''" />
                    <span v-if="registerErrors.password" class="text-xs text-red-500 mt-1 block">{{
                        registerErrors.password }}</span>
                </div>

                <a-button type="primary" block size="large" html-type="submit" :loading="isRegisterSubmitting"
                    class="!bg-gradient-to-r from-purple-500 to-purple-600 !border-0 !font-semibold mb-4">
                    Đăng Ký
                </a-button>

                <div class="text-center">
                    <span class="text-xs text-gray-600">
                        Bằng cách đăng ký, bạn đồng ý với
                        <a-button type="link" class="!text-purple-600 !p-0 !h-auto text-xs hover:!text-purple-700">
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
import { useRouter } from 'vue-router';
import { AuthService } from '@/api/services/auth';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();

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
    } catch (error) {
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
        const data = await AuthService.register({
            email: registerForm.value.email,
            phone: registerForm.value.phone,
            password: registerForm.value.password
        });

        message.success('Đăng ký thành công!');

        isLogin.value = true;

        // Reset form
        registerForm.value = { email: '', phone: '', password: '' };
    } catch (error) {
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
    border-radius: 12px;
    padding: 0;
}

.auth-modal :deep(.ant-modal-header) {
    border-bottom: none;
    padding: 0;
}

.auth-modal :deep(.ant-modal-close) {
    top: 16px;
    right: 16px;
}

/* Gradient text for title */
.auth-title-gradient {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
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
    border-radius: 6px !important;
    border-color: #d1d5db !important;
    transition: all 0.2s ease;
}

:deep(.ant-input:hover),
:deep(.ant-input-password input:hover) {
    border-color: #8b5cf6 !important;
}

:deep(.ant-input:focus),
:deep(.ant-input-password input:focus) {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1) !important;
}

:deep(.ant-input-status-error),
:deep(.ant-input-password.ant-input-status-error input) {
    border-color: #ef4444 !important;
}
</style>
