import { showReportDialog } from '@sentry/browser';

const getUserFeedback = vm => axios.get('api/sentry').then(({ data }) => {
    if (data.eventId) {
        showReportDialog({
            eventId: data.eventId,
            title: vm.i18n('It looks like we’re having issues.'),
            subtitle: vm.i18n('Our team has been notified.'),
            subtitle2: vm.i18n('If you’d like to help, tell us what happened below.'),
            labelName: vm.i18n('Name'),
            labelEmail: vm.i18n('Email'),
            labelComments: vm.i18n('What happened?'),
            labelClose: vm.i18n('Close'),
            labelSubmit: vm.i18n('Submit'),
            errorGeneric: vm.i18n('An unknown error occurred while submitting your report. Please try again.'),
            errorFormEntry: vm.i18n('Some fields were invalid. Please correct the errors and try again.'),
        });
    } else {
        vm.$toastr.error(vm.i18n('Something went wrong...'));
    }
});

const sessionExpired = (vm, status) => [401, 419].includes(status) && vm.$store.state.auth.isAuth;

const redirectToLogin = (vm) => {
    vm.$store.commit('setLastRoute', vm.$route);
    vm.$store.commit('appState', false);
    vm.$store.commit('auth/logout');
    vm.$router.push({ name: 'login' });
};

const shouldDisplayToastr = status => [403, 409, 429, 555].includes(status);

const pageNotFound = status => status === 404;

const maintenanceMode = status => status === 503;

export default {
    methods: {
        errorHandler(error) {
            if (!error.response) {
                throw error;
            }

            const { status, data } = error.response;

            if (sessionExpired(this, status)) {
                redirectToLogin(this);
                return;
            }

            if (shouldDisplayToastr(status)) {
                this.$toastr.error(data.message);
                return;
            }

            if (pageNotFound(status)) {
                this.$router.push({ name: 'notFound' });
                return;
            }

            if (maintenanceMode(status)) { // TODO add front-end maintenance mode page
                window.location.reload();
            }

            getUserFeedback(this);
        },
    },
};
