\connect mapbender;

INSERT INTO public.alembic_version (version_num)
VALUES ('1ea185ba1c63');

INSERT INTO public.mb_user (
  mb_user_id,
  mb_user_name,
  mb_user_password,
  mb_user_owner,
  mb_user_email,
  mb_user_password_ticket,
  mb_user_active
)
VALUES (
  2,
  'verwalter',
  'ea6d9b22ccadc0b2a65918eba27bef1d',
  1,
  'ea6d9b22ccadc0b2a65918eba27bef1d', -- ??? why the password hash for email???
  'ea6d9b22ccadc0b2a65918eba27bef1d',
  true
);


INSERT INTO public.mb_role
  (role_id, role_name, role_description, role_exclude_auth)
VALUES
  (1, 'standard role', 'No special role - old behaviour.', 0),
  (2, 'primary', 'Primary group for a mapbender user.', 0),
  (3, 'metadata editor', 'Group for which the user can edit and publish metadata.', 1);


INSERT INTO public.mb_group
  (mb_group_id, mb_group_name, mb_group_owner, mb_group_description, mb_group_title, mb_group_ext_id, mb_group_address, mb_group_postcode, mb_group_city, mb_group_stateorprovince, mb_group_country, mb_group_voicetelephone, mb_group_facsimiletelephone, mb_group_email, mb_group_logo_path, mb_group_homepage)
VALUES
  (318, 'mm_admin', 2, '', 'mm_admin', NULL, '', '', '', '', '', '', '', '', '', NULL);


INSERT INTO public.mb_user_mb_group
  (fkey_mb_user_id, fkey_mb_group_id, mb_user_mb_group_type)
VALUES
  (2, 318, 1);


INSERT INTO public.mm_projects
  (id, "name")
VALUES
  (32, 'test');


INSERT INTO public.mm_project_group
  (mm_project_id, mb_group_id)
VALUES
  (32, 318);


INSERT INTO public.mm_project_settings
  (id, "name", project, settings)
VALUES
  (47, 'test', 'test', '{"map": {"layers": ["stadtplan_bi"], "crs": "EPSG:25832", "center": [468209.88937, 5764309.73843], "catalogGroups": [], "visibleCatalogLayers": [], "catalogLayers": [], "zoom": 8, "sidebarStatus": "closed", "visibleCatalogGroups": []}, "layerswitcher": {"deleted": [], "open": [], "order": [{"layers": ["fahrraddistanz_pl"], "name": "vector_fahrraddistanz"}]}, "name": "test", "projectName": "fahrraddistanz", "controls": {"measureSrs": "EPSG:4326", "catalogVariant": "abstract"}, "print": {"cellsX": 5, "outputFormat": {"mimetype": "application/pdf", "fileEnding": "pdf", "value": "pdf", "label": "PDF"}, "scale": 2500, "cellsY": 5}}');


INSERT INTO public.mm_project_settings_user
  (mm_project_settings_id, mb_user_id)
VALUES
  (47, 2);
