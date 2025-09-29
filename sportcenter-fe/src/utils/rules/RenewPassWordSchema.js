import * as Yup from 'yup';

export const RenewPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .required('Vui lòng nhập mật khẩu')
        .matches(
            /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-+]).{8,20}$/,
            'Mật khẩu phải chứa ít nhất 1 chữ số, 1 chữ thường, 1 chữ hoa, 1 ký tự đặc biệt và có độ dài từ 8-20 ký tự'
        ),
    comfirmPassword: Yup.string()
        .required('Vui lòng nhập lại mật khẩu')
        .oneOf([Yup.ref('password')], 'Mật khẩu nhập lại không khớp'),
    resetPasswordCode: Yup.string()
        .required('Vui lòng nhập mã xác thực khôi phục mật khẩu')
        .matches(/^\d{6}$/, 'Mã xác thực phải bao gồm 6 chữ số'),
});
