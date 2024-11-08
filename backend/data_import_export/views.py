from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from tablib import Dataset
from django.http import HttpResponse
from import_export import resources
from django.core.exceptions import ValidationError
from django.views import View
from rest_framework.permissions import IsAuthenticated, AllowAny
from employees.models import Employee

# Define resources for import-export
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from tablib import Dataset
from django.http import HttpResponse
from import_export import resources
from employees.models import Employee, EmployeePersonalDetails, EmployeeJobDetails

from .resources import EmployeeResource

class EmployeeImportExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        """
        Export Employee data as CSV or XLS.
        """
        try:
            export_format = request.query_params.get('format', 'csv')
            if export_format not in ['csv', 'xls']:
                return Response({"error": "Invalid format. Use 'csv' or 'xls'."}, status=status.HTTP_400_BAD_REQUEST)

            resource = EmployeeResource()  # You can switch this to other resources like EmployeePersonalDetailsResource or EmployeeJobDetailsResource
            dataset = resource.export()

            if export_format == 'xls':
                file_format = 'application/vnd.ms-excel'
                content = dataset.xls
                filename = 'employees.xls'
            else:
                file_format = 'text/csv'
                content = dataset.csv
                filename = 'employees.csv'

            response = HttpResponse(content, content_type=file_format)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, format=None):
        """
        Import Employee data from a CSV or XLS file.
        """
        try:
            file = request.FILES.get('file')

            if not file:
                return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

            # Determine the file format
            if file.name.endswith('.xls'):
                dataset = Dataset().load(file.read(), format='xls')
            elif file.name.endswith('.csv'):
                dataset = Dataset().load(file.read().decode('utf-8'), format='csv')
            else:
                return Response({"error": "Invalid file format. Only CSV and XLS files are allowed."}, status=status.HTTP_400_BAD_REQUEST)

            resource = EmployeeResource()
            result = resource.import_data(dataset, dry_run=True)  # Test the import first

            # Check if there are any errors
            if result.has_errors():
                # Get a list of the error details
                error_details = []
                for error in result.row_errors():
                    row_number = error[0]
                    error_info = error[1]
                    error_details.append(f"Row {row_number}: {error_info}")
                
                return Response({"error": "Errors found in import data", "details": error_details}, status=status.HTTP_400_BAD_REQUEST)

            resource.import_data(dataset, dry_run=False)  # Actually perform the import

            return Response({'status': 'Import completed'}, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TestView(View):
    def get(self,request):
        return HttpResponse('hello, world')