import * as Yup from 'yup';

export const SignupSchema = Yup.object().shape({
    fullName: Yup.string().max(50, 'Full name cannot exceed 50 characters').required('Please enter your full name'),
    email: Yup.string().email('Please enter a valid email address').required('Please enter your email'),
    password: Yup.string()
        .matches(
            /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-+]).{8,20}$/,
            'Password must contain at least 1 number, 1 lowercase, 1 uppercase, 1 special character, and be 8-20 characters long'
        )
        .required('Please enter a password'),
    passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
});
