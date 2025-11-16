from django.test.runner import DiscoverRunner

class RealDbTestRunner(DiscoverRunner):
    """ Test runner for using real database, not creating/destroying test DBs! """
    def setup_databases(self, **kwargs):
        pass  # Skip creating test DBs

    def teardown_databases(self, old_config, **kwargs):
        pass  # Skip destroying test DBs
