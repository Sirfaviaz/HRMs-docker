from accounts.models import User

class UserRepository:
    @staticmethod
    def get_user_by_email(email):
        return User.objects.filter(email=email).first()

    @staticmethod
    def get_user_by_pk(pk):
        return User.objects.filter(pk=pk).first()

    @staticmethod
    def save_user(user):
        user.save()
